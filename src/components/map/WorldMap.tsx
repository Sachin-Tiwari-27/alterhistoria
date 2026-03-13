import { useEffect, useRef, useCallback } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { useGameStore } from "@/store/gameStore";
import { useDiploStore } from "@/store/diploStore";
import { useUIStore } from "@/store/uiStore";
import { COUNTRIES } from "@/data/countries";

export function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined>>();
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown>>();

  const { player, nations } = useGameStore();
  const { addToChannel } = useDiploStore();
  const { setTab } = useUIStore();

  const getCountryFill = useCallback(
    (id: string) => {
      if (!player) return "#1e3a50";
      if (id === player.id)
        return player.customColor ?? player.color ?? "#d4a843";
      if (player.friends.includes(id)) return "#1a5030";
      if (player.foes.includes(id)) return "#5a1515";
      const nation = nations[id] ?? COUNTRIES[id];
      return nation?.color ?? "#1e3a50";
    },
    [player, nations],
  );

  // Re-colour map whenever player relations change
  useEffect(() => {
    if (!gRef.current) return;
    gRef.current
      .selectAll<SVGPathElement, { id: string }>(".country")
      .attr("fill", (d) => getCountryFill(String(d.id)));
  }, [getCountryFill]);

  // Initial map setup
  useEffect(() => {
    if (!svgRef.current) return;
    const container = svgRef.current.parentElement!;
    const W = container.clientWidth;
    const H = container.clientHeight;

    const svg = d3.select(svgRef.current).attr("width", W).attr("height", H);

    svg.selectAll("*").remove();

    const projection = d3
      .geoNaturalEarth1()
      .scale(W / 6.3)
      .translate([W / 2, H / 2]);

    const pathGen = d3.geoPath().projection(projection);

    const zoom = d3
      .zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 12])
      .on("zoom", (e) => g.attr("transform", e.transform));
    zoomRef.current = zoom;
    svg.call(zoom);

    svg
      .append("rect")
      .attr("width", W)
      .attr("height", H)
      .attr("fill", "#071525");

    const g = svg.append("g");
    gRef.current = g;

    // Graticule
    g.append("path")
      .datum(d3.geoGraticule()())
      .attr("d", pathGen)
      .attr("fill", "none")
      .attr("stroke", "rgba(255,255,255,0.04)")
      .attr("stroke-width", 0.5);

    // Load world data
    d3.json<any>(
      "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json",
    ).then((topo) => {
      const countries = topojson.feature(topo, topo.objects.countries);

      g.selectAll(".country")
        .data((countries as any).features)
        .join("path")
        .attr("class", "country")
        .attr("d", pathGen as any)
        .attr("fill", (d: any) => getCountryFill(String(d.id)))
        .attr("stroke", "#0d2035")
        .attr("stroke-width", 0.4)
        .style("cursor", "pointer")
        .style("transition", "fill 0.3s")
        .on("mouseover", function () {
          d3.select(this).attr("stroke", "#d4a843").attr("stroke-width", 1.2);
        })
        .on("mouseout", function (_, d: any) {
          const isPlayer = String(d.id) === player?.id;
          d3.select(this)
            .attr("stroke", isPlayer ? "#d4a843" : "#0d2035")
            .attr("stroke-width", isPlayer ? 1.5 : 0.4);
        })
        .on("click", (_: any, d: any) => {
          if (!player) return;
          addToChannel(String(d.id));
          setTab("diplomacy");
        });

      // Borders mesh
      g.append("path")
        .datum(topojson.mesh(topo, topo.objects.countries) as any)
        .attr("fill", "none")
        .attr("stroke", "#0d2035")
        .attr("stroke-width", 0.4)
        .attr("d", pathGen as any);
    });
  }, []); // intentionally empty — colour updates handled separately

  return (
    <svg
      ref={svgRef}
      className="w-full h-full block"
      style={{ cursor: "crosshair" }}
    />
  );
}
