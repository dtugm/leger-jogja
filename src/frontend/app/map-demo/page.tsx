"use client";

import { useEffect, useState } from "react";

import { GeoJSONLayer, registerPMTiles } from "@/components/maplibre/map-helpers";
import MaplibreMap from "@/components/maplibre/maplibre-map";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const BASEMAPS = {
    voyager: "https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json",
    dark: "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json",
    positron: "https://basemaps.cartocdn.com/gl/positron-gl-style/style.json",
    osm: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    satellite: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
    hybrid: "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
};

const SAMPLE_POINTS = {
    type: "FeatureCollection",
    features: Array.from({ length: 50 }, (_, i) => ({
        type: "Feature",
        properties: { id: i, name: `Point ${i}` },
        geometry: {
            type: "Point",
            coordinates: [
                110.3671 + (Math.random() - 0.5) * 0.1,
                -7.7956 + (Math.random() - 0.5) * 0.1
            ]
        }
    }))
};

export default function MapDemoPage() {
    const [style, setStyle] = useState(BASEMAPS.voyager);
    const [showPoints, setShowPoints] = useState(true);
    const [useClustering, setUseClustering] = useState(true);

    useEffect(() => {
        registerPMTiles();
    }, []);

    return (
        <div className="w-full h-screen relative overflow-hidden flex flex-col">
            <div className="p-4 bg-background border-b z-10">
                <h1 className="text-2xl font-bold">MapLibre Reusable Component Demo</h1>
                <p className="text-muted-foreground text-sm">Demonstrating basemap switching, vector layers, clustering, and overlays.</p>
            </div>

            <div className="flex-1 relative">
                <MaplibreMap
                    mapStyle={style}
                    center={[110.3671, -7.7956]}
                    zoom={12}
                >
                    {showPoints && (
                        <GeoJSONLayer
                            id="sample-points"
                            data={SAMPLE_POINTS}
                            type="circle"
                            cluster={useClustering}
                            paint={{
                                "circle-color": "#ff5500",
                                "circle-radius": 6,
                                "circle-stroke-width": 2,
                                "circle-stroke-color": "#ffffff"
                            }}
                        />
                    )}

                    <div className="absolute top-4 left-4 w-64 z-20 pointer-events-auto">
                        <Card className="shadow-xl bg-background/90 backdrop-blur">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium">Map Controls</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-xs uppercase text-muted-foreground">Basemap</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        {Object.entries(BASEMAPS).map(([name, url]) => (
                                            <Button
                                                key={name}
                                                variant={style === url ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => setStyle(url)}
                                                className="capitalize"
                                            >
                                                {name}
                                            </Button>
                                        ))}
                                    </div>
                                </div>

                                <hr />

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="show-points" className="text-sm">Show Points</Label>
                                    <Switch
                                        id="show-points"
                                        checked={showPoints}
                                        onCheckedChange={setShowPoints}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <Label htmlFor="use-clustering" className="text-sm">Enable Clustering</Label>
                                    <Switch
                                        id="use-clustering"
                                        checked={useClustering}
                                        onCheckedChange={setUseClustering}
                                        disabled={!showPoints}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                </MaplibreMap>
            </div>
        </div>
    );
}