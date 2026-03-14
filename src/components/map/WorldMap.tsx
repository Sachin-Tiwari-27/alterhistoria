import { useEffect, useRef, useCallback, useState } from 'react'
import * as d3 from 'd3'
import * as topojson from 'topojson-client'
import { useGameStore } from '@/store/gameStore'
import { useDiploStore } from '@/store/diploStore'
import { useUIStore } from '@/store/uiStore'
import { COUNTRIES } from '@/data/countries'
import type { CountryBase } from '@/types'
import { getCountryFill, type MapMode } from '@/lib/mapColors'

interface TooltipState {
  x: number
  y: number
  country: CountryBase | null
}

export function WorldMap() {
  const svgRef = useRef<SVGSVGElement>(null)
  const gRef = useRef<d3.Selection<SVGGElement, unknown, null, undefined> | null>(null)
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const [tooltip, setTooltip] = useState<TooltipState>({ x: 0, y: 0, country: null })
  const [mapLoaded, setMapLoaded] = useState(false)

  const player = useGameStore((s) => s.player)
  const nations = useGameStore((s) => s.nations)
  const occupations = useGameStore((s) => s.occupations)
  const theme = useUIStore((s) => s.theme)
  const addToChannel = useDiploStore((s) => s.addToChannel)
  const setTab = useUIStore((s) => s.setTab)
  const setShowNationSelect = useUIStore((s) => s.setShowNationSelect)

  const [mapMode, setMapMode] = useState<MapMode>('political')

  const oceanColor = theme === 'dark' ? '#050505' : '#f3f4f6'

  const getCountryFillWrapper = useCallback(
    (id: string): string => {
      return getCountryFill(id, player, nations, occupations, theme, mapMode)
    },
    [player, nations, occupations, theme, mapMode]
  )

  // Re-colour whenever relations, occupations, or theme changes
  useEffect(() => {
    if (!gRef.current || !mapLoaded) return
    gRef.current
      .selectAll<SVGPathElement, { id: number }>('.country')
      .attr('fill', (d) => getCountryFillWrapper(String(d.id)))
  }, [getCountryFillWrapper, mapLoaded])

  // Initial map setup — runs once
  useEffect(() => {
    if (!svgRef.current) return
    const container = svgRef.current.parentElement!
    const W = container.clientWidth
    const H = container.clientHeight

    const svg = d3.select(svgRef.current).attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    // Ocean
    svg.append('rect').attr('width', W).attr('height', H).attr('fill', oceanColor)

    const projection = d3.geoNaturalEarth1()
      .scale(W / 6.3)
      .translate([W / 2, H / 2])
    const pathGen = d3.geoPath().projection(projection)

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 14])
      .on('zoom', (e) => { gRef.current?.attr('transform', e.transform) })
    zoomRef.current = zoom
    svg.call(zoom)

    const g = svg.append('g')
    gRef.current = g

    // Graticule
    g.append('path')
      .datum(d3.geoGraticule()())
      .attr('d', pathGen as unknown as null)
      .attr('fill', 'none')
      .attr('stroke', theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.06)')
      .attr('stroke-width', 0.5)

    // Load world TopoJSON
    d3.json<TopoJSON.Topology>('https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json')
      .then((topo) => {
        if (!topo) return
        const countries = topojson.feature(topo, topo.objects.countries as TopoJSON.GeometryCollection)

        g.selectAll('.country')
          .data(countries.features)
          .join('path')
          .attr('class', 'country')
          .attr('d', pathGen as unknown as null)
          .attr('fill', (d) => getCountryFillWrapper(String(d.id)))
          .attr('stroke', theme === 'dark' ? '#27272a' : '#e5e7eb')
          .attr('stroke-width', 0.4)
          .style('cursor', 'pointer')
          .style('transition', 'fill 0.3s')
          .on('mousemove', (event: MouseEvent, d) => {
            const country = COUNTRIES[String(d.id)] ?? null
            setTooltip({ x: event.clientX, y: event.clientY, country })
          })
          .on('mouseleave', () => setTooltip({ x: 0, y: 0, country: null }))
          .on('click', (_: MouseEvent, d) => {
            const id = String(d.id)
            const effectiveId = occupations[id] ?? id
            
            if (!player) {
              // Pre-game: clicking opens nation select for the mapped effective nation
              useGameStore.getState().startGame(effectiveId)
              setShowNationSelect(true) // Just keeping UI consistency, though startGame handles it
              return
            }
            if (effectiveId === player.id) {
              setTab('advisor')
              return
            }
            addToChannel(effectiveId)
            setTab('diplomacy')
          })

        // Border mesh
        g.append('path')
          .datum(topojson.mesh(topo, topo.objects.countries as TopoJSON.GeometryCollection))
          .attr('fill', 'none')
          .attr('stroke', theme === 'dark' ? '#0d2035' : '#8a8070')
          .attr('stroke-width', 0.4)
          .attr('d', pathGen as unknown as null)

        setMapLoaded(true)
      })
      .catch(console.error)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleZoom = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, factor)
  }

  const handleReset = () => {
    if (!svgRef.current || !zoomRef.current) return
    d3.select(svgRef.current).transition().duration(500).call(zoomRef.current.transform, d3.zoomIdentity)
  }

  return (
    <div className="w-full h-full relative">
      <svg ref={svgRef} className="w-full h-full block" />

      {/* Zoom controls */}
      <div className="absolute bottom-3 right-3 flex flex-col gap-1">
        {/* Map Mode Toggle */}
        <div className="flex flex-col mb-2 gap-1">
          <button
            onClick={() => setMapMode('political')}
            className={`px-2 py-1.5 text-[9px] font-cinzel rounded-sm border transition-colors ${
              mapMode === 'political' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card/90 text-muted-foreground border-border hover:border-primary'
            }`}
          >
            POLITICAL
          </button>
          <button
            onClick={() => setMapMode('territorial')}
            className={`px-2 py-1.5 text-[9px] font-cinzel rounded-sm border transition-colors ${
              mapMode === 'territorial' ? 'bg-primary text-primary-foreground border-primary' : 'bg-card/90 text-muted-foreground border-border hover:border-primary'
            }`}
          >
            TERRITORIAL
          </button>
        </div>

        {[{ label: '+', factor: 1.4 }, { label: '−', factor: 0.7 }, { label: '⊞', factor: 0 }].map(({ label, factor }) => (
          <button
            key={label}
            onClick={() => factor === 0 ? handleReset() : handleZoom(factor)}
            className="w-8 h-8 flex items-center justify-center bg-card/90 border border-border text-foreground hover:border-primary hover:text-primary text-sm transition-colors rounded-sm"
          >
            {label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur-sm border border-border rounded-sm px-3 py-2 text-[10px] font-cinzel tracking-wide pointer-events-none shadow-2xl">
        <div className="text-[8px] text-muted-foreground mb-2 pb-1 border-b border-border/50 uppercase tracking-widest">{mapMode} VIEW</div>
        {[
          { color: theme === 'dark' ? '#d4a843' : '#b48833', label: 'You / Controlled' },
          ...(mapMode === 'political' ? [
            { color: theme === 'dark' ? '#166534' : '#22c55e', label: 'Ally / Allied Colony' },
            { color: theme === 'dark' ? '#991b1b' : '#ef4444', label: 'Rival / Rival Colony' },
          ] : []),
          { color: theme === 'dark' ? '#27272a' : '#d4d4d8', label: 'Occupied/Colony' },
          { color: theme === 'dark' ? '#1a1a1a' : '#f5f5f5', label: 'Neutral', border: theme === 'dark' ? '#333' : '#ddd' },
        ].map(({ color, label, border }) => (
          <div key={label} className="flex items-center gap-2 mb-1 last:mb-0">
            <div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: color, border: border ? `1px solid ${border}` : undefined }} />
            <span className="text-muted-foreground">{label}</span>
          </div>
        ))}
      </div>

      {/* Tooltip */}
      {tooltip.country && (
        <div
          className="fixed z-40 pointer-events-none bg-card border border-border rounded-sm shadow-xl p-3 min-w-[200px] max-w-[260px]"
          style={{ left: tooltip.x + 14, top: tooltip.y - 20 }}
        >
          <div className="font-cinzel text-primary text-xs mb-2">
            {tooltip.country.flag} {tooltip.country.name}
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-[10px] mb-2">
            {(['gdp', 'military', 'stability', 'tech'] as const).map((k) => (
              <div key={k} className="flex justify-between">
                <span className="text-muted-foreground capitalize">{k}</span>
                <span className="font-mono-game text-foreground">{tooltip.country![k]}</span>
              </div>
            ))}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pop.</span>
              <span className="font-mono-game text-foreground">{tooltip.country.population}M</span>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground leading-relaxed border-t border-border pt-2 italic">
            {tooltip.country.context.slice(0, 120)}…
          </p>
          {occupations[tooltip.country.id] && (
            <div className="mt-2 text-[10px] text-destructive font-cinzel tracking-widest uppercase">
              Current ruler:<br/>
              {nations[occupations[tooltip.country.id]]?.name ?? COUNTRIES[occupations[tooltip.country.id]]?.name}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
