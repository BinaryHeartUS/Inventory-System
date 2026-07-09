-- No DROP FUNCTION here: the Get_Devices view depends on this function, so it
-- cannot be dropped while that view exists (Flyway would abort). CREATE OR REPLACE
-- covers body changes; a signature/return-type change needs a versioned migration.
create or replace function Get_Charger_Status (
	p_laptopID INTEGER,
	p_tabletID INTEGER,
	p_laptop_charger CHARGER_STATUS,
	p_tablet_charger CHARGER_STATUS
)
returns CHARGER_STATUS
language plpgsql
as $$
begin
	IF p_laptopID IS NOT NULL THEN
		RETURN p_laptop_charger;
	END IF;

	RETURN p_tablet_charger;
end;
$$;
