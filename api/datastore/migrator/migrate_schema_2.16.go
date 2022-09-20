package migrator

import "github.com/rs/zerolog/log"

// TODO
func (m *Migrator) migrateFunc1() error {
	log.Info().Msg("migrate func1")

	return nil
}

func (m *Migrator) migrateFunc2() error {
	log.Info().Msg("migrate func2")

	return nil
}
