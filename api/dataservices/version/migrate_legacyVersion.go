package version

import (
	"log"

	"github.com/portainer/portainer/api/database/models"
)

const (
	legacyDBVersionKey = "DB_VERSION"
	legacyInstanceKey  = "INSTANCE_ID"
	legacyEditionKey   = "EDITION"
)

var dbVerToSemVerMap = map[int]string{
	18: "1.21.0",
	19: "1.22.0",
	20: "1.22.1",
	21: "1.22.2",
	22: "1.23.0",
	23: "1.24.0",
	24: "1.24.1",
	25: "2.0.0",
	26: "2.1.0",
	27: "2.2.0",
	28: "2.4.0", // EE?
	29: "2.4.0", // EE?
	30: "2.6.0",
	31: "2.7.0", // EE?
	32: "2.9.0",
	33: "2.9.1",
	34: "2.10.0",
	35: "2.9.3", // dockerhub fix
	36: "2.12.0",
	40: "2.13.0",
	50: "2.14.0",
	51: "2.14.1",
	52: "2.14.2",
	60: "2.15.0",
	70: "2.16.0",
}

func dbVersionToSemanticVersion(dbVersion int) string {
	ver, ok := dbVerToSemVerMap[dbVersion]
	if !ok {
		// For versions older than 17, just return "1.0.0".
		// Later we will error out as we don't support upgrading versions older than 18
		if dbVersion <= 17 {
			return "1.0.0"
		}

		// what to do here..?
		log.Fatal("Unknown legacy version: ", dbVersion)
	}

	return ver
}

// migrateLegacyVersion to new Version struct
func (service *Service) migrateLegacyVersion() error {
	dbVersion := 0
	edition := 0
	instanceId := ""

	err := service.connection.GetObject(BucketName, []byte(legacyDBVersionKey), &dbVersion)
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
		SchemaVersion: dbVersionToSemanticVersion(dbVersion),
		Edition:       edition,
		InstanceID:    string(instanceId),
	}

	err = service.UpdateVersion(v)
	if err != nil {
		return err
	}

	// Remove legacy keys
	service.connection.DeleteObject(BucketName, []byte(legacyDBVersionKey))
	service.connection.DeleteObject(BucketName, []byte(legacyEditionKey))
	service.connection.DeleteObject(BucketName, []byte(legacyInstanceKey))
	return nil
}
