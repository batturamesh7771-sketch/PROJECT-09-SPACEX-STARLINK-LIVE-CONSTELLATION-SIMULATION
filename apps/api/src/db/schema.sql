-- Satellites catalog
CREATE TABLE IF NOT EXISTS satellites (
  norad_id INTEGER PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  intl_designator VARCHAR(20),
  launch_date DATE,
  decay_date DATE,
  object_type VARCHAR(20) DEFAULT 'UNKNOWN',
  country VARCHAR(10),
  operator VARCHAR(255),
  constellation VARCHAR(100),
  orbit_type VARCHAR(10) DEFAULT 'UNKNOWN',
  status VARCHAR(20) DEFAULT 'UNKNOWN',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- TLE history
CREATE TABLE IF NOT EXISTS tle_history (
  id SERIAL PRIMARY KEY,
  norad_id INTEGER REFERENCES satellites(norad_id) ON DELETE CASCADE,
  name VARCHAR(255),
  line1 VARCHAR(70) NOT NULL,
  line2 VARCHAR(70) NOT NULL,
  epoch TIMESTAMPTZ NOT NULL,
  source VARCHAR(20) DEFAULT 'celestrak',
  fetched_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(norad_id, epoch)
);

-- Current/latest TLEs (materialized for fast access)
CREATE TABLE IF NOT EXISTS tle_current (
  norad_id INTEGER PRIMARY KEY REFERENCES satellites(norad_id) ON DELETE CASCADE,
  name VARCHAR(255),
  line1 VARCHAR(70) NOT NULL,
  line2 VARCHAR(70) NOT NULL,
  epoch TIMESTAMPTZ NOT NULL,
  source VARCHAR(20) DEFAULT 'celestrak',
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Constellation definitions
CREATE TABLE IF NOT EXISTS constellations (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  operator VARCHAR(255),
  description TEXT,
  category VARCHAR(30),
  planned_satellites INTEGER,
  orbit_type VARCHAR(10),
  altitude_km REAL,
  inclination_deg REAL
);

-- Constellation satellite membership
CREATE TABLE IF NOT EXISTS constellation_members (
  constellation_id VARCHAR(50) REFERENCES constellations(id) ON DELETE CASCADE,
  norad_id INTEGER REFERENCES satellites(norad_id) ON DELETE CASCADE,
  PRIMARY KEY (constellation_id, norad_id)
);

-- API key rate limit tracking
CREATE TABLE IF NOT EXISTS api_key_usage (
  provider VARCHAR(50) PRIMARY KEY,
  requests_made INTEGER DEFAULT 0,
  window_start TIMESTAMPTZ DEFAULT NOW(),
  window_duration_ms INTEGER,
  max_requests INTEGER,
  last_request_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tle_history_norad ON tle_history(norad_id);
CREATE INDEX IF NOT EXISTS idx_tle_history_epoch ON tle_history(epoch);
CREATE INDEX IF NOT EXISTS idx_satellites_constellation ON satellites(constellation);
CREATE INDEX IF NOT EXISTS idx_satellites_status ON satellites(status);

-- Phase 2: Space Weather Kp Index History
CREATE TABLE IF NOT EXISTS space_weather_kp (
  timestamp TIMESTAMPTZ PRIMARY KEY,
  kp REAL NOT NULL,
  a_running REAL DEFAULT 0,
  station_count INTEGER DEFAULT 0,
  storm_level VARCHAR(20) DEFAULT 'QUIET',
  source VARCHAR(20) DEFAULT 'noaa'
);

-- Phase 2: Space Weather Events (Flares, CMEs, Storms)
CREATE TABLE IF NOT EXISTS space_weather_events (
  id VARCHAR(100) PRIMARY KEY,
  event_type VARCHAR(30) NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  peak_time TIMESTAMPTZ,
  class_or_speed VARCHAR(50),
  source_location VARCHAR(50),
  is_earth_directed BOOLEAN DEFAULT FALSE,
  details JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 2: Rocket Launches
CREATE TABLE IF NOT EXISTS launches (
  id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  status VARCHAR(30) NOT NULL,
  net TIMESTAMPTZ NOT NULL,
  window_start TIMESTAMPTZ,
  window_end TIMESTAMPTZ,
  provider_name VARCHAR(255),
  rocket_name VARCHAR(255),
  mission_name VARCHAR(255),
  mission_orbit VARCHAR(100),
  pad_name VARCHAR(255),
  pad_location VARCHAR(255),
  pad_lat REAL,
  pad_lon REAL,
  image_url TEXT,
  raw_data JSONB,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 2: Spaceflight News Articles
CREATE TABLE IF NOT EXISTS space_news (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT NOT NULL,
  image_url TEXT,
  news_site VARCHAR(100),
  summary TEXT,
  published_at TIMESTAMPTZ NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_launches_net ON launches(net);
CREATE INDEX IF NOT EXISTS idx_space_weather_events_type ON space_weather_events(event_type, start_time DESC);
CREATE INDEX IF NOT EXISTS idx_space_news_published ON space_news(published_at DESC);

-- Phase 3: Conjunction Data Messages (CDM) & Close Approach Alerts
CREATE TABLE IF NOT EXISTS conjunction_alerts (
  cdm_id VARCHAR(60) PRIMARY KEY,
  tca TIMESTAMPTZ NOT NULL,
  min_range_km REAL NOT NULL,
  rel_speed_kms REAL NOT NULL,
  collision_prob DOUBLE PRECISION NOT NULL,
  risk_level VARCHAR(20) NOT NULL,
  sat1_norad INTEGER NOT NULL,
  sat1_name VARCHAR(255) NOT NULL,
  sat2_norad INTEGER NOT NULL,
  sat2_name VARCHAR(255) NOT NULL,
  raw_data JSONB,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 3: Near-Earth Object (NEO) Close Approaches (JPL CAD)
CREATE TABLE IF NOT EXISTS neo_close_approaches (
  id VARCHAR(100) PRIMARY KEY,
  designation VARCHAR(50) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  approach_date TIMESTAMPTZ NOT NULL,
  dist_lunar REAL NOT NULL,
  dist_km DOUBLE PRECISION NOT NULL,
  v_rel_kms REAL NOT NULL,
  h_mag REAL,
  diameter_min_m REAL,
  diameter_max_m REAL,
  is_pha BOOLEAN DEFAULT FALSE,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 3: JPL Sentry Earth Impact Risk Monitoring
CREATE TABLE IF NOT EXISTS sentry_risks (
  designation VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  ip_cumulative DOUBLE PRECISION NOT NULL,
  ps_cumulative REAL NOT NULL,
  ts_max INTEGER DEFAULT 0,
  impact_count INTEGER DEFAULT 0,
  year_range VARCHAR(40),
  diameter_km REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 3: Atmospheric Fireball / Bolide Events (JPL Fireball)
CREATE TABLE IF NOT EXISTS fireball_events (
  id VARCHAR(60) PRIMARY KEY,
  event_date TIMESTAMPTZ NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  alt_km REAL,
  velocity_kms REAL,
  energy_kt REAL NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conjunction_tca ON conjunction_alerts(tca);
CREATE INDEX IF NOT EXISTS idx_neo_approach_date ON neo_close_approaches(approach_date);
CREATE INDEX IF NOT EXISTS idx_fireball_date ON fireball_events(event_date DESC);

-- Phase 4: NASA EONET Natural Events
CREATE TABLE IF NOT EXISTS eonet_natural_events (
  id VARCHAR(60) PRIMARY KEY,
  title TEXT NOT NULL,
  category_id VARCHAR(50) NOT NULL,
  category_title VARCHAR(100) NOT NULL,
  event_date TIMESTAMPTZ NOT NULL,
  lat REAL NOT NULL,
  lon REAL NOT NULL,
  magnitude_value REAL,
  magnitude_unit VARCHAR(30),
  source_url TEXT,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 4: Solar System Planetary & Spacecraft Ephemerides (JPL Horizons)
CREATE TABLE IF NOT EXISTS planetary_ephemerides (
  body_id VARCHAR(30) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  helio_x_au DOUBLE PRECISION NOT NULL,
  helio_y_au DOUBLE PRECISION NOT NULL,
  helio_z_au DOUBLE PRECISION NOT NULL,
  helio_r_au DOUBLE PRECISION NOT NULL,
  geo_dist_au DOUBLE PRECISION NOT NULL,
  light_time_min REAL NOT NULL,
  orbital_speed_kms REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 4: NASA Mars Rover Surface Imagery
CREATE TABLE IF NOT EXISTS mars_rover_photos (
  id INTEGER PRIMARY KEY,
  sol INTEGER NOT NULL,
  earth_date DATE,
  img_src TEXT NOT NULL,
  camera_name VARCHAR(50),
  camera_full_name VARCHAR(150),
  rover_name VARCHAR(50),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_eonet_category ON eonet_natural_events(category_id, event_date DESC);
CREATE INDEX IF NOT EXISTS idx_mars_photos_rover ON mars_rover_photos(rover_name, sol DESC);

-- Phase 5: NASA Exoplanet Archive Confirmed Worlds
CREATE TABLE IF NOT EXISTS exoplanets (
  pl_name VARCHAR(100) PRIMARY KEY,
  hostname VARCHAR(100) NOT NULL,
  disc_year INTEGER,
  discovery_method VARCHAR(80),
  orb_per_days REAL,
  rade_earth REAL,
  bmasse_earth REAL,
  eq_temp_k REAL,
  sy_dist_pc REAL,
  is_habitable BOOLEAN DEFAULT FALSE,
  esi_score REAL,
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 5: LIGO / Virgo / KAGRA Gravitational Wave Events (GWOSC)
CREATE TABLE IF NOT EXISTS gravitational_wave_events (
  common_name VARCHAR(60) PRIMARY KEY,
  catalog_name VARCHAR(60),
  event_utc TIMESTAMPTZ,
  mass_1_solar REAL,
  mass_2_solar REAL,
  final_mass_solar REAL,
  chirp_mass_solar REAL,
  distance_mpc REAL,
  network_snr REAL,
  merger_type VARCHAR(20),
  fetched_at TIMESTAMPTZ DEFAULT NOW()
);

-- Phase 5: NASA Deep Space Network (DSN) Live Telemetry Links
CREATE TABLE IF NOT EXISTS dsn_telemetry_links (
  dish_name VARCHAR(30) PRIMARY KEY,
  complex VARCHAR(30) NOT NULL,
  target_spacecraft VARCHAR(60) NOT NULL,
  down_freq_ghz REAL,
  down_rate_kbps REAL,
  rtlt_hours REAL,
  distance_mkm REAL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exoplanets_esi ON exoplanets(esi_score DESC);
CREATE INDEX IF NOT EXISTS idx_gw_events_snr ON gravitational_wave_events(network_snr DESC);

-- Phase 6: 10,000+ Multi-Key Rotation Vault & Offline Snapshots
CREATE TABLE IF NOT EXISTS api_key_vault (
  id VARCHAR(80) PRIMARY KEY,
  provider VARCHAR(60) NOT NULL,
  category VARCHAR(80) NOT NULL,
  api_key TEXT NOT NULL,
  label VARCHAR(120),
  requests_made INTEGER DEFAULT 0,
  max_requests_per_hour INTEGER DEFAULT 1000,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS offline_snapshots (
  id VARCHAR(80) PRIMARY KEY,
  version VARCHAR(30) NOT NULL,
  satellite_count INTEGER DEFAULT 0,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_key_vault_provider ON api_key_vault(provider, status);





