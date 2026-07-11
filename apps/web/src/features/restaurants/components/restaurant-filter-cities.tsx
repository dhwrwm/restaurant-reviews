import { getCities } from "../api/get-cities";
import { RestaurantFilterInput } from "./restaurant-filter-input";

export async function RestaurantFilterCities() {
  const cities = await getCities();

  return (
    <RestaurantFilterInput
      label="City"
      placeholder="Any"
      queryKey="city"
      options={cities.map((_c) => ({ value: _c, label: _c }))}
    />
  );
}
