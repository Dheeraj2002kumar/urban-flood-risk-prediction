# Dataset Catalog

This document records the provenance, coverage, resolutions, update frequencies, licenses, and limitations of datasets evaluated for the Urban Flood Risk Prediction System (Greater Mumbai Pilot).

## 1. Rainfall Observations
- **Provider:** India Meteorological Department (IMD) / MCGM Automatic Weather Stations (AWS).
- **URL:** https://mausam.imd.gov.in/
- **Geographic Coverage:** Greater Mumbai (Colaba, Santacruz, Kurla, Dadar, Andheri).
- **Time Period:** 2018–2023 Monsoon Seasons (June 1 – September 30).
- **Resolution:** 1-hour and 24-hour accumulations.
- **License:** Open Government Data (OGD) Platform India.
- **Limitations:** Spatial interpolations can miss hyper-localized micro-burst downpours occurring within 2–3 km radii.

## 2. Digital Elevation Model (DEM)
- **Provider:** Copernicus Data Space Ecosystem (Copernicus DEM GLO-30).
- **URL:** https://dataspace.copernicus.eu/
- **Vertical Datum:** EGM2008 geoid.
- **Spatial Resolution:** 30 metres (approx. 1 arc-second).
- **License:** Free and open access for research and commercial use under Copernicus terms.
- **Limitations:** Bare-earth elevations can underestimate urban surface features such as flyovers, metro piers, and railway embankment berms that alter surface runoff paths.

## 3. Urban Land Cover & Imperviousness
- **Provider:** ESA WorldCover (2021/2022).
- **URL:** https://worldcover2021.esa.int/
- **Spatial Resolution:** 10 metres.
- **License:** Creative Commons Attribution 4.0 International (CC-BY 4.0).
- **Limitations:** Annual composite; recent local civil construction or pavement alterations within 6 months may not be represented.

## 4. Hydrology & Waterway Network
- **Provider:** OpenStreetMap (OSM) contributors.
- **URL:** https://www.openstreetmap.org/
- **Features:** Mithi River main stem, Mahim Creek, Dahisar River, Arabian Sea shoreline, major drainage nullahs.
- **License:** Open Data Commons Open Database License (ODbL).
- **Limitations:** Underground storm drainage culverts and pipe capacities are not fully digitized in public open maps.

## 5. Historical Flood Occurrence Labels
- **Provider:** Municipal Corporation of Greater Mumbai (MCGM) Disaster Management Unit historical chronic waterlogging inventories.
- **URL:** https://dm.mcgm.gov.in/
- **Definition:** Documented surface inundation exceeding 0.3 metres for >1 hour leading to traffic or civic disruption.
- **Coverage:** 20 chronic hotspots across Mumbai.
