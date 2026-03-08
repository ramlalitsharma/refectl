"use client";

import { useRouter } from "next/navigation";

interface CountryDropdownProps {
    initialCountries: string[];
}

export function CountryDropdown({ initialCountries }: CountryDropdownProps) {
    const router = useRouter();

    return (
        <select
            className="appearance-none bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer pt-1 pb-1 pr-6 text-[1.35rem] font-bold text-[#111111] dark:text-white outline-none focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800 transition-colors bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2224%22%20height%3D%2224%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%23666%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-no-repeat bg-[right_0px_center] bg-[length:18px_18px]"
            defaultValue="World"
            onChange={(e) => {
                if (e.target.value !== "World") {
                    router.push(`/news?country=${encodeURIComponent(e.target.value)}`);
                } else {
                    router.push("/news");
                }
            }}
        >
            <option value="World">World</option>
            {initialCountries.map((country) => (
                <option key={country} value={country}>
                    {country}
                </option>
            ))}
        </select>
    );
}
