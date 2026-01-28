# Data Directory

This folder contains the datasets used by the water quality monitoring system.

## Files

- `synthetic_dataset.csv` - Main dataset with water quality readings

## Dataset Schema

| Column | Description |
|--------|-------------|
| timestamp | Reading timestamp |
| pressure_bar | Water pressure in bar |
| flow_rate_L_min | Flow rate in liters per minute |
| total_volume_L | Total volume in liters |
| tds_ppm | Total dissolved solids in ppm |
| ph | pH level |
| temperature_C | Temperature in Celsius |
| signal_strength_dBm | WiFi signal strength |
| pressure_status | Pressure classification (Normal/High/Low) |
| tds_status | TDS classification (Good/Poor) |
| ph_status | pH classification (Normal/Acidic/Alkaline) |
| wifi_status | Connection status |
| sensor_status | Sensor health status |
| alert | Alert message if any |

## For Client Devices

Copy `synthetic_dataset.csv` to this folder on each client device participating in federated learning.
