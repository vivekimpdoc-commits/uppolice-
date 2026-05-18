import numpy as np
from sklearn.cluster import DBSCAN
import pandas as pd

class HotspotPredictor:
    def __init__(self):
        # DBSCAN parameters for clustering GPS coordinates
        # eps is the max distance between two samples to be in the same neighborhood
        # min_samples is the number of samples in a neighborhood for a point to be considered a core point
        self.model = DBSCAN(eps=0.01, min_samples=3)

    def predict_hotspots(self, historical_data: list[dict]):
        """
        historical_data: List of dicts containing 'lat', 'lng', 'severity', 'timestamp'
        Returns clustered hotspots.
        """
        if not historical_data:
            return []
            
        df = pd.DataFrame(historical_data)
        coords = df[['lat', 'lng']].values
        
        # Fit clustering model
        clusters = self.model.fit_predict(coords)
        df['cluster'] = clusters
        
        # Filter out noise (-1)
        hotspots = df[df['cluster'] != -1]
        
        # Calculate cluster centers
        cluster_centers = hotspots.groupby('cluster')[['lat', 'lng']].mean().reset_index()
        
        results = []
        for _, row in cluster_centers.iterrows():
            results.append({
                "lat": row['lat'],
                "lng": row['lng'],
                "risk_level": "High", # Real implementation would calculate this based on severity/frequency
                "radius_meters": 500
            })
            
        return results

hotspot_predictor = HotspotPredictor()
