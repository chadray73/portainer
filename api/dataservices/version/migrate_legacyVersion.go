package version

import (
	"strconv"

	"github.com/portainer/portainer/api/database/models"
)

const (
	legacyVersionKey  = "DB_VERSION"
	legacyInstanceKey = "INSTANCE_ID"
	legacyEditionKey  = "EDITION"
)

// migrateLegacyVersion to new Version struct
func (service *Service) migrateLegacyVersion() error {
	dbVersion := 0
	edition := 0
	instanceId := ""

	err := service.connection.GetObject(BucketName, []byte(legacyVersionKey), &dbVersion)
	if err != nil {
		return err
	}

	err = service.connection.GetObject(BucketName, []byte(legacyEditionKey), &edition)
	if err != nil {
		return err
	}

	err = service.connection.GetObject(BucketName, []byte(legacyInstanceKey), &instanceId)
	if err != nil {
		return err
	}

	v := &models.Version{
		SchemaVersion: strconv.Itoa(dbVersion),
		Edition:       edition,
		InstanceID:    string(instanceId),
	}

	err = service.UpdateVersion(v)
	if err != nil {
		return err
	}

	// Remove legacy keys
	service.connection.DeleteObject(BucketName, []byte(legacyVersionKey))
	service.connection.DeleteObject(BucketName, []byte(legacyEditionKey))
	service.connection.DeleteObject(BucketName, []byte(legacyInstanceKey))

	return nil
}
