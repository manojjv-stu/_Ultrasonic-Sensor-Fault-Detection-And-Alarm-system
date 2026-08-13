# Ultrasonic Sensor Fault Detection & Alarm System

## Project Overview

The **Ultrasonic Sensor Fault Detection & Alarm System** is a browser-based simulation developed to demonstrate real-time monitoring, anomaly detection, fault classification, and alarm generation for ultrasonic sensors in marine environments.

The system simulates ultrasonic sensor behaviour under normal operating conditions and multiple fault scenarios. It continuously updates sensor parameters, calculates a fault score, generates system-status alarms, visualizes signal behaviour using live charts, and allows simulated sensor data to be recorded and exported as CSV.

> **Note:** This project is currently a simulation-based system. It does not acquire data from a physical ultrasonic sensor and does not currently use a trained machine-learning model.

---

## Objectives

* Simulate real-time ultrasonic sensor behaviour.
* Monitor important sensor parameters continuously.
* Demonstrate detection of different ultrasonic sensor fault conditions.
* Calculate an anomaly/fault score based on simulated sensor behaviour.
* Generate pre-fault warnings and fault alarms.
* Visualize sensor signals and parameter trends.
* Simulate marine operating conditions such as sea state and ship speed.
* Record simulated sensor data and export it in CSV format.

---

## Key Features

### 1. Real-Time Sensor Monitoring

The dashboard continuously monitors:

* Signal Strength (%)
* Echo Return Time (ms)
* Measured Distance (m)
* Noise Level (dB)
* Waveform Amplitude
* Fault Score
* System Status

The simulation updates at a rate of **2.5 Hz (one update every 400 ms)**.

---

### 2. Fault Scenario Simulation

The system provides the following operating and fault scenarios:

| Scenario                    | Simulated Behaviour                                            |
| --------------------------- | -------------------------------------------------------------- |
| Normal Operation            | Nominal sensor behaviour                                       |
| Signal Noise / Interference | Increased noise and reduced signal quality                     |
| Echo Drift                  | Increased echo return time and distance deviation              |
| Weak Signal                 | Progressive signal attenuation representing transducer fouling |
| Signal Dropout              | Intermittent or complete loss of signal                        |
| Spike / Transducer Fault    | Abnormal waveform spikes and increased fault score             |

The fault scenarios are implemented directly in the simulation logic and can be injected from the dashboard.

---

### 3. Fault Detection and Alarm System

The system assigns a fault score between **0 and 1** and uses threshold-based status classification:

* **Fault Score < 0.25** → Normal
* **0.25 ≤ Fault Score < 0.55** → Pre-Fault Warning
* **Fault Score ≥ 0.55** → Fault Alarm

When a fault condition is detected, the dashboard updates the system status and records an alarm event.

---

### 4. Real-Time Visualization

The dashboard provides:

* Live ultrasonic waveform visualization
* Anomaly/fault-score visualization
* Signal-strength trend
* Noise-level trend
* Fault-specific waveform charts
* Fault-specific trend charts
* Fault severity indicators
* Alarm event log

---

### 5. Marine Operating Conditions

The simulation includes adjustable environmental and operational parameters:

* Sea State
* Ship Speed

These parameters influence the simulated sensor signal and noise characteristics.

---

### 6. Data Recording and CSV Export

The system includes a built-in data-recording module.

Users can:

1. Start recording.
2. Inject different fault scenarios.
3. Monitor the recorded data.
4. Stop recording.
5. Download the simulated data as a CSV file.

The simulation records data at **2.5 Hz (400 ms interval)**.

The exported dataset includes:

* `timestamp_ist`
* `elapsed_s`
* `tick`
* `signal_strength_pct`
* `echo_return_time_ms`
* `measured_distance_m`
* `noise_level_dB`
* `wave_amplitude`
* `fault_score`
* `system_status`
* `injected_fault`
* `sea_state`
* `sea_state_label`
* `ship_speed_kn`

---

## Fault Scenarios

### Signal Noise / Interference

This scenario simulates increased noise and degradation of signal quality caused by interference.

The simulation increases noise, reduces signal strength, and increases the fault score progressively.

Possible marine causes include:

* Electromagnetic interference
* Acoustic interference
* Nearby machinery
* Radar or propulsion-related interference

---

### Echo Drift — Temperature Shift

This scenario simulates a change in echo-return time caused by variations in the assumed speed of sound.

The simulated effect includes:

* Increasing echo-return time
* Distance measurement deviation
* Progressive fault-score increase
* Mild signal degradation

---

### Weak Signal — Transducer Fouling

This scenario represents degradation of the ultrasonic transducer due to marine growth or debris.

The simulation produces:

* Reduced signal strength
* Reduced waveform amplitude
* Increased fault score
* Progressive signal attenuation

---

### Signal Dropout

This scenario represents intermittent or complete loss of the ultrasonic sensor signal.

The system can produce:

* Signal strength approaching zero
* Zero or degraded waveform
* High fault score
* Fault alarm generation
* Invalid distance indication during complete signal loss

---

### Spike / Transducer Fault

This scenario introduces abnormal waveform spikes and increases the fault score.

It represents conditions such as:

* Transducer malfunction
* Abnormal sensor output
* Sudden signal disturbances

---

## Distance Calculation

The simulated distance is calculated from the ultrasonic echo return time using the relationship:

**Distance = (Echo Time × Speed of Sound) / 2**

The current simulation uses an assumed speed of sound of **343 m/s**.

For the simulated echo time, the implementation calculates the distance from the echo-return time and applies additional simulated environmental jitter.

> This is a simplified simulation model and does not represent a complete marine acoustic propagation model.

---

## Technology Stack

* **HTML5** — Application structure
* **CSS3** — Dashboard styling and responsive layout
* **JavaScript** — Simulation logic, fault generation, alarm handling and data recording
* **Chart.js** — Real-time data visualization
* **Web Browser** — Application execution

---

## Project Architecture

```text
                 ┌─────────────────────────┐
                 │     User Interface      │
                 │   HTML + CSS Dashboard  │
                 └────────────┬────────────┘
                              │
                              ▼
                 ┌─────────────────────────┐
                 │   Simulation Engine     │
                 │       JavaScript        │
                 └────────────┬────────────┘
                              │
               ┌──────────────┼──────────────┐
               │              │              │
               ▼              ▼              ▼
        Sensor Simulation  Environment   Fault Injection
        Signal / Echo /    Sea State /   Noise / Drift /
        Noise / Waveform   Ship Speed    Weak / Dropout /
                                             Spike
               │              │              │
               └──────────────┼──────────────┘
                              ▼
                 ┌─────────────────────────┐
                 │    Fault Score &        │
                 │    Status Evaluation    │
                 └────────────┬────────────┘
                              │
               ┌──────────────┼──────────────┐
               ▼              ▼              ▼
          Live Charts      Alarm Log      CSV Recording
```

---

## How to Run

### Option 1 — Run Locally

1. Clone or download the repository.
2. Open the project folder.
3. Open `index.html` in a modern web browser.
4. The simulation will start automatically.

### Option 2 — Using VS Code

1. Open the project folder in VS Code.
2. Open `index.html`.
3. Run it using a browser or a local development server.
4. Interact with the dashboard and inject different fault scenarios.

No backend server or database is required for the current simulation.

---

## How to Use the Dashboard

### Normal Operation

Select:

**Normal Operation**

The dashboard displays nominal simulated sensor behaviour.

### Inject a Fault

Select one of the available fault scenarios:

* Signal Noise / Interference
* Echo Drift
* Weak Signal
* Signal Dropout
* Spike / Transducer Fault

Observe the corresponding changes in:

* Sensor signal
* Noise
* Echo time
* Distance
* Waveform
* Fault score
* System status
* Alarm log

### Adjust Marine Conditions

Use the controls to change:

* Sea State
* Ship Speed

These parameters modify the simulated operating conditions.

### Record Data

1. Click **Start Recording**.
2. Allow the simulation to generate data.
3. Inject one or more fault scenarios.
4. Click **Stop Recording**.
5. Click **Download CSV**.

---

## Marine Applications

The simulation demonstrates concepts relevant to:

* Ultrasonic sensor health monitoring
* Marine obstacle detection
* Shipboard sensor monitoring
* Predictive maintenance systems
* Marine safety systems
* Condition monitoring of ultrasonic sensors

---

## Current Limitations

The current version is a **software simulation** and has the following limitations:

* No physical ultrasonic sensor is connected.
* No real-time hardware data acquisition is implemented.
* No trained machine-learning model is currently integrated.
* Sensor behaviour is generated using predefined simulation equations and randomized variation.
* The speed-of-sound model is simplified.
* The system is intended for demonstration and academic purposes rather than direct deployment on a marine vessel.

---

## Future Improvements

### Machine Learning

* Train an anomaly-detection model using recorded sensor data.
* Implement supervised fault classification.
* Compare rule-based and ML-based fault detection.
* Evaluate model accuracy using precision, recall and F1-score.

### Hardware Integration

* Connect an actual ultrasonic sensor.
* Acquire real-time sensor measurements.
* Integrate an ESP32 or other embedded controller.
* Transfer sensor data to the monitoring dashboard.

### Communication

* Add MQTT communication.
* Implement cloud-based monitoring.
* Enable remote alarm notifications.

### Advanced Marine Modelling

* Add temperature compensation.
* Implement a more realistic seawater speed-of-sound model.
* Incorporate pressure/depth effects.
* Improve sea-state and ship-motion modelling.

### Predictive Maintenance

* Store long-term sensor histories.
* Detect gradual sensor degradation.
* Estimate remaining useful life.
* Generate maintenance recommendations.

---

## Repository Structure

```text
ultrasonic-sensor-fault-detection/
│
├── index.html
├── README.md
├── .gitignore
│
├── assets/
│   └── screenshots/
│
├── docs/
│   ├── project-report.pdf
│   └── architecture.png
│
└── data/
    └── sample-data.csv
```

---

## Project Status

**Status:** Academic Simulation Project

**Current Version:** Simulation-based prototype

**Hardware:** Not currently connected

**Machine Learning:** Planned future enhancement

**Data Source:** Simulated sensor data

---

## Author

**Manoj J V**

CSE – Data Science Engineering

Academic Project

---

## License

This project is developed for academic and educational purposes.
