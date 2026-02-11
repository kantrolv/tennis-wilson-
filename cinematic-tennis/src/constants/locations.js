const LOCATION_DATA = [
    {
        name: "India",
        countryCode: "IN",
        phoneCode: "+91",
        phoneLength: 10,
        postalCodeRegex: /^\d{6}$/,
        states: [
            "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
            "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
            "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
            "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand",
            "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
            "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
        ]
    },
    {
        name: "United States",
        countryCode: "US",
        phoneCode: "+1",
        phoneLength: 10,
        postalCodeRegex: /^\d{5}(-\d{4})?$/,
        states: [
            "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
            "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
            "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
            "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
            "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
            "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
            "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
        ]
    },
    {
        name: "United Kingdom",
        countryCode: "GB",
        phoneCode: "+44",
        phoneLength: 10,
        postalCodeRegex: /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i,
        states: [
            "England", "Scotland", "Wales", "Northern Ireland"
        ]
    },
    {
        name: "Australia",
        countryCode: "AU",
        phoneCode: "+61",
        phoneLength: 9,
        postalCodeRegex: /^\d{4}$/,
        states: [
            "New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia",
            "Tasmania", "Australian Capital Territory", "Northern Territory"
        ]
    },
    {
        name: "Canada",
        countryCode: "CA",
        phoneCode: "+1",
        phoneLength: 10,
        postalCodeRegex: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
        states: [
            "Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador",
            "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island",
            "Quebec", "Saskatchewan", "Yukon"
        ]
    },
    {
        name: "Japan",
        countryCode: "JP",
        phoneCode: "+81",
        phoneLength: 10,
        postalCodeRegex: /^\d{3}-? \d{4}$/,
        states: [
            "Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki",
            "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama",
            "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie",
            "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane",
            "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi",
            "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"
        ]
    },
    {
        name: "France",
        countryCode: "FR",
        phoneCode: "+33",
        phoneLength: 9,
        postalCodeRegex: /^\d{5}$/,
        states: [
            "Auvergne-Rhône-Alpes", "Bourgogne-Franche-Comté", "Brittany", "Centre-Val de Loire",
            "Corsica", "Grand Est", "Hauts-de-France", "Île-de-France", "Normandy", "Nouvelle-Aquitaine",
            "Occitanie", "Pays de la Loire", "Provence-Alpes-Côte d'Azur"
        ]
    },
    {
        name: "Germany",
        countryCode: "DE",
        phoneCode: "+49",
        phoneLength: 10,
        postalCodeRegex: /^\d{5}$/,
        states: [
            "Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse",
            "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate",
            "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"
        ]
    }
];

export default LOCATION_DATA;
