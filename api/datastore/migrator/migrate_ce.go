package migrator

import (
	"errors"
	"reflect"
	"runtime"

	portainer "github.com/portainer/portainer/api"

	"github.com/Masterminds/semver"
	werrors "github.com/pkg/errors"
	"github.com/rs/zerolog/log"
)

type migration struct {
	version *semver.Version
	migrate func() error
}

func migrationError(err error, context string) error {
	return werrors.Wrap(err, "failed in "+context)
}

func newMigration(v string, migrationFunc func() error) migration {
	return migration{
		version: semver.MustParse(v),
		migrate: migrationFunc,
	}
}

func dbTooOldError() error {
	return errors.New("migrating from less than Portainer 1.21.0 is not supported, please contact Portainer support.")
}

func GetFunctionName(i interface{}) string {
	return runtime.FuncForPC(reflect.ValueOf(i).Pointer()).Name()
}

// Migrate checks the database version and migrate the existing data to the most recent data model.
func (m *Migrator) Migrate() error {
	// set DB to updating status
	err := m.versionService.StoreIsUpdating(true)
	if err != nil {
		return migrationError(err, "StoreIsUpdating")
	}

	version, err := m.versionService.Version()
	if err != nil {
		return migrationError(err, "get version service")
	}

	// Do not alter the order of the migrations. Even though one looks wrong, it is not.
	migrations := []migration{
		newMigration("1.0.0", dbTooOldError), // default version found after migration
		newMigration("1.21", m.updateUsersToDBVersion18),
		newMigration("1.21", m.updateEndpointsToDBVersion18),
		newMigration("1.21", m.updateEndpointGroupsToDBVersion18),
		newMigration("1.21", m.updateRegistriesToDBVersion18),
		newMigration("1.22", m.updateSettingsToDBVersion19),
		newMigration("1.22.1", m.updateUsersToDBVersion20),
		newMigration("1.22.1", m.updateSettingsToDBVersion20),
		newMigration("1.22.1", m.updateSchedulesToDBVersion20),
		newMigration("1.23", m.updateResourceControlsToDBVersion22),
		newMigration("1.23", m.updateUsersAndRolesToDBVersion22),
		newMigration("1.24", m.updateTagsToDBVersion23),
		newMigration("1.24", m.updateEndpointsAndEndpointGroupsToDBVersion23),
		newMigration("1.24.1", m.updateSettingsToDB24),
		newMigration("2.0", m.updateSettingsToDB25),
		newMigration("2.0", m.updateStacksToDB24),
		newMigration("2.1", m.updateEndpointSettingsToDB25),
		newMigration("2.2", m.updateStackResourceControlToDB27),
		newMigration("2.6", m.migrateDBVersionToDB30),
		newMigration("2.9", m.migrateDBVersionToDB32),
		newMigration("2.9.2", m.migrateDBVersionToDB33),
		newMigration("2.10.0", m.migrateDBVersionToDB34),
		newMigration("2.9.3", m.migrateDBVersionToDB35),
		newMigration("2.12", m.migrateDBVersionToDB36),
		newMigration("2.13", m.migrateDBVersionToDB40),
		newMigration("2.14", m.migrateDBVersionToDB50),
		newMigration("2.15", m.migrateDBVersionToDB60),
		//newMigration("2.16", m.migrateSchemaTo2_16),
	}

	schemaVersion, err := semver.NewVersion(version.SchemaVersion)
	if err != nil {
		return migrationError(err, "invalid db schema version")
	}

	lastVersion := ""
	for _, migration := range migrations {
		if schemaVersion.LessThan(migration.version) {

			if lastVersion != migration.version.String() {
				log.Info().Msgf("migrating database to version %s", migration.version.String())
			}

			err := migration.migrate()
			if err != nil {
				return migrationError(err, GetFunctionName(migration.migrate))
			}

			lastVersion = migration.version.String()
		}
	}

	version.SchemaVersion = portainer.APIVersion

	err = m.versionService.UpdateVersion(version)
	if err != nil {
		return migrationError(err, "StoreDBVersion")
	}

	log.Info().Str("to_version", portainer.APIVersion).Msg("migrating DB")

	// reset DB updating status
	return m.versionService.StoreIsUpdating(false)
}
