import { inputCls, labelCls } from "../utils/formStyles";

/**
 * Shared address sub-form. Renders inside a parent `sm:grid-cols-2` grid;
 * the street field spans both columns.
 */
export function AddressFields({
  street,
  city,
  state,
  zipCode,
  country,
  setStreet,
  setCity,
  setState,
  setZipCode,
  setCountry,
}: {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  setStreet: (v: string) => void;
  setCity: (v: string) => void;
  setState: (v: string) => void;
  setZipCode: (v: string) => void;
  setCountry: (v: string) => void;
}) {
  return (
    <>
      <div className="sm:col-span-2">
        <label className={labelCls}>Street</label>
        <input
          value={street}
          onChange={(e) => setStreet(e.target.value)}
          maxLength={100}
          placeholder="123 Main St"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>City</label>
        <input
          value={city}
          onChange={(e) => setCity(e.target.value)}
          maxLength={50}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>State</label>
        <input
          value={state}
          onChange={(e) => setState(e.target.value)}
          maxLength={50}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>ZIP</label>
        <input
          value={zipCode}
          onChange={(e) => setZipCode(e.target.value.replace(/\D/g, ""))}
          maxLength={20}
          inputMode="numeric"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Country</label>
        <input
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          maxLength={50}
          className={inputCls}
        />
      </div>
    </>
  );
}
