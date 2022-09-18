package version

import (
	"strconv"

	portainer "github.com/portainer/portainer/api"
	"github.com/portainer/portainer/api/database/models"
)

const (
	// BucketName represents the name of the bucket where this service stores data.
	BucketName  = "version"
	versionKey  = "VERSION"
	updatingKey = "DB_UPDATING"
)

// Service represents a service to manage stored versions.
type Service struct {
	connection portainer.Connection
}

func (service *Service) BucketName() string {
	return BucketName
}

// NewService creates a new instance of a service.
func NewService(connection portainer.Connection) (*Service, error) {
	err := connection.SetServiceName(BucketName)
	if err != nil {
		return nil, err
	}

	return &Service{
		connection: connection,
	}, nil
}

// DBVersion retrieves the stored database version.
func (service *Service) DBVersion() (int, error) {
	v, err := service.Version()
	if err != nil {
		return 0, err
	}

	return strconv.Atoi(v.SchemaVersion)
}

// Edition retrieves the stored portainer edition.
func (service *Service) Edition() (portainer.SoftwareEdition, error) {
	v, err := service.Version()
	if err != nil {
		return 0, err
	}

	return portainer.SoftwareEdition(v.Edition), nil
}

// StoreDBVersion store the database version.
func (service *Service) StoreDBVersion(version int) error {
	v, err := service.Version()
	if err != nil {
		return err
	}

	v.SchemaVersion = strconv.Itoa(version)
	return service.UpdateVersion(v)
}

// IsUpdating retrieves the database updating status.
func (service *Service) IsUpdating() (bool, error) {
	var isUpdating bool
	err := service.connection.GetObject(BucketName, []byte(updatingKey), &isUpdating)
	return isUpdating, err
}

// StoreIsUpdating store the database updating status.
func (service *Service) StoreIsUpdating(isUpdating bool) error {
	return service.connection.UpdateObject(BucketName, []byte(updatingKey), isUpdating)
}

// InstanceID retrieves the stored instance ID.
func (service *Service) InstanceID() (string, error) {
	v, err := service.Version()
	if err != nil {
		return "", err
	}

	return v.InstanceID, nil
}

// StoreInstanceID store the instance ID.
func (service *Service) StoreInstanceID(ID string) error {
	v, err := service.Version()
	if err != nil {
		return err
	}

	v.InstanceID = ID
	return service.UpdateVersion(v)
}

// Version retrieve the version object.
func (service *Service) Version() (*models.Version, error) {
	var v models.Version

	err := service.connection.GetObject(BucketName, []byte(versionKey), &v)
	if err != nil {
		return nil, err
	}

	return &v, nil
}

// UpdateVersion persists a Version object.
func (service *Service) UpdateVersion(version *models.Version) error {
	return service.connection.UpdateObject(BucketName, []byte(versionKey), version)
}

func (service *Service) Migrate() error {
	return service.migrateLegacyVersion()
}
