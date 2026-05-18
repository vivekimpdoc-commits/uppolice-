# Mocked HotspotPredictor to run without heavy C++ ML dependencies (scikit-learn, numpy, pandas)

class HotspotPredictor:
    def __init__(self):
        pass

    def predict_hotspots(self, historical_data: list[dict]):
        """
        historical_data: List of dicts containing 'lat', 'lng', 'severity', 'timestamp'
        Returns mocked clustered hotspots.
        """
        if not historical_data:
            return []
            
        results = [
            {
                "lat": 26.8467,
                "lng": 80.9462,
                "risk_level": "High", 
                "radius_meters": 500
            },
            {
                "lat": 26.8500,
                "lng": 80.9500,
                "risk_level": "Medium", 
                "radius_meters": 300
            }
        ]
            
        return results

hotspot_predictor = HotspotPredictor()
