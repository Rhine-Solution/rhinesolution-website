"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import type { ChartConfiguration } from "chart.js/auto";
import ChartDataLabels from "chartjs-plugin-datalabels";
import {
  TIMELINE_EVENTS,
  COUNTRY_DATA,
  GROWTH_DATA,
  JOURNEY_STEPS,
  TAXONOMY_ROOT,
  TAXONOMY_BRANCHES,
  ROUTINE_NODES,
  wrapText,
  type DfirChartType,
} from "./dfir-chart-data";

Chart.register(ChartDataLabels);

type Props = {
  type: DfirChartType;
};

const INK = "#F2F5FF";
const MUTED = "#B5B0A8";
const GRID = "rgba(126, 167, 255, 0.14)";
const TIMELINE = "#7EA7FF";
const BARS = "#2C6BFF";
const BARS_HOVER = "#C4A882";

export default function DfirChart({ type }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const config = buildConfig(type) as ChartConfiguration;
    const chart = new Chart(canvas, config);
    chartRef.current = chart;

    return () => {
      chart.destroy();
      chartRef.current = null;
    };
  }, [type]);

  return <canvas ref={canvasRef} role="img" aria-label={labelFor(type)} />;
}

function labelFor(type: DfirChartType): string {
  switch (type) {
    case "timeline":
      return "Timeline of internet history milestones from 1969 to 2005";
    case "country":
      return "Bar chart of the share of internet users by country";
    case "growth":
      return "Bar chart of internet users worldwide growing from 1 billion in 2005 to 5.4 billion in 2023";
    case "journey":
      return "Flow diagram of the seven stages a message travels through from device to destination";
    case "taxonomy":
      return "Diagram of cybercrime categories: cyber-dependent, cyber-enabled and David Wall's four categories";
    case "routine":
      return "Diagram of routine activity theory: motivated offender, suitable target and capable guardian";
  }
}

function buildConfig(type: DfirChartType) {
  switch (type) {
    case "timeline":
      return buildTimelineConfig();
    case "country":
      return buildCountryConfig();
    case "growth":
      return buildGrowthConfig();
    case "journey":
      return buildJourneyConfig();
    case "taxonomy":
      return buildTaxonomyConfig();
    case "routine":
      return buildRoutineConfig();
  }
}

function timelineTooltip() {
  return {
    displayColors: false,
    padding: 12,
    titleFont: { weight: "bold" as const },
    callbacks: {
      title: (items: { parsed: { x: number } }[]) =>
        items.length ? String(items[0].parsed.x) : "",
      label: (ctx: { raw: { event: string } }) => wrapText(ctx.raw.event, 64),
    },
  };
}

function buildTimelineConfig() {
  return {
    type: "scatter" as const,
    data: {
      datasets: [
        {
          label: "Internet milestones",
          data: TIMELINE_EVENTS.map((e) => ({ x: e.year, y: 1, event: e.event })),
          showLine: true,
          tension: 0,
          borderColor: "rgba(126, 167, 255, 0.55)",
          borderWidth: 2,
          pointBackgroundColor: TIMELINE,
          pointBorderColor: INK,
          pointBorderWidth: 2,
          pointRadius: 7,
          pointHoverRadius: 11,
          pointHoverBackgroundColor: BARS_HOVER,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: timelineTooltip(),
        datalabels: {
          formatter: (v: { x: number }) => String(v.x),
          anchor: "center" as const,
          align: (ctx: { dataIndex: number }) =>
            ctx.dataIndex % 2 === 0 ? ("top" as const) : ("bottom" as const),
          offset: 10,
          color: TIMELINE,
          font: { size: 10, weight: "600" as const },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: 1968,
          max: 2006,
          title: { display: true, text: "Year", color: MUTED },
          grid: { color: GRID },
          ticks: { stepSize: 4, precision: 0, color: MUTED },
        },
        y: {
          min: 0,
          max: 2,
          border: { display: false },
          grid: { color: GRID },
          ticks: { display: false },
          title: { display: false },
        },
      },
    },
  };
}

function buildCountryConfig() {
  const sorted = [...COUNTRY_DATA].sort((a, b) => b.share - a.share);
  return {
    type: "bar" as const,
    data: {
      labels: sorted.map((c) => c.country),
      datasets: [
        {
          label: "Share of internet users",
          data: sorted.map((c) => c.share),
          backgroundColor: "rgba(44, 107, 255, 0.85)",
          hoverBackgroundColor: BARS_HOVER,
          borderRadius: 6,
          maxBarThickness: 42,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: { label: string; parsed: { y: number } }) =>
              `${ctx.label}: ${ctx.parsed.y}%`,
          },
        },
        datalabels: {
          formatter: (v: number) => `${v}%`,
          anchor: "end" as const,
          align: "end" as const,
          offset: 2,
          color: BARS,
          font: { size: 11, weight: "bold" as const },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Country", color: MUTED },
          grid: { display: false },
          ticks: { maxRotation: 60, minRotation: 45, font: { size: 10 }, color: MUTED },
        },
        y: {
          min: 0,
          max: 25,
          title: { display: true, text: "Share of internet users (%)", color: MUTED },
          grid: { color: GRID },
          ticks: { stepSize: 5, callback: (v: string | number) => `${v}%`, color: MUTED },
        },
      },
    },
  };
}

function buildGrowthConfig() {
  return {
    type: "bar" as const,
    data: {
      labels: GROWTH_DATA.map((d) => String(d.year)),
      datasets: [
        {
          label: "Internet users (billions)",
          data: GROWTH_DATA.map((d) => d.users),
          backgroundColor: "rgba(44, 107, 255, 0.85)",
          hoverBackgroundColor: BARS_HOVER,
          borderRadius: 8,
          maxBarThickness: 90,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          displayColors: false,
          callbacks: {
            label: (ctx: { parsed: { y: number } }) => `${ctx.parsed.y} billion users`,
          },
        },
        datalabels: {
          formatter: (v: number) => `${v}bn`,
          anchor: "end" as const,
          align: "end" as const,
          offset: 4,
          color: BARS,
          font: { size: 13, weight: "bold" as const },
        },
      },
      scales: {
        x: {
          title: { display: true, text: "Year", color: MUTED },
          grid: { display: false },
          ticks: { color: MUTED },
        },
        y: {
          beginAtZero: true,
          max: 6,
          title: { display: true, text: "People online (billions)", color: MUTED },
          grid: { color: GRID },
          ticks: { stepSize: 1, color: MUTED },
        },
      },
    },
  };
}

// Shared scatter base for the three diagram types.
function diagramBase() {
  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        displayColors: false,
        padding: 12,
        titleFont: { weight: "bold" as const },
      },
    },
    scales: {
      x: {
        type: "linear" as const,
        border: { display: false },
        grid: { display: false },
        ticks: { display: false },
        title: { display: false },
      },
      y: {
        type: "linear" as const,
        border: { display: false },
        grid: { display: false },
        ticks: { display: false },
        title: { display: false },
      },
    },
  };
}

// Vertical flow of the seven steps a message travels.
function buildJourneyConfig() {
  const points = JOURNEY_STEPS.map((s) => ({ x: s.step, y: 0, title: s.title, body: s.body }));
  return {
    type: "scatter" as const,
    data: {
      datasets: [
        {
          label: "Message journey",
          data: points,
          showLine: true,
          tension: 0.1,
          borderColor: "rgba(126, 167, 255, 0.7)",
          borderWidth: 2.5,
          pointBackgroundColor: TIMELINE,
          pointBorderColor: INK,
          pointBorderWidth: 2,
          pointRadius: 8,
          pointHoverRadius: 12,
          pointHoverBackgroundColor: BARS_HOVER,
        },
      ],
    },
    options: {
      ...diagramBase(),
      plugins: {
        ...diagramBase().plugins,
        tooltip: {
          ...diagramBase().plugins.tooltip,
          callbacks: {
            title: (items: { raw: { title: string } }[]) =>
              items.length ? items[0].raw.title : "",
            label: (ctx: { raw: { body: string } }) => wrapText(ctx.raw.body, 60),
          },
        },
        datalabels: {
          formatter: (v: { title: string }) => v.title,
          anchor: "center" as const,
          align: "top" as const,
          offset: 12,
          color: INK,
          font: { size: 11, weight: "600" as const },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: 0.6,
          max: 7.4,
          border: { display: false },
          grid: { display: false },
          ticks: { display: false },
          title: { display: false },
        },
        y: {
          type: "linear" as const,
          min: -0.9,
          max: 0.9,
          border: { display: false },
          grid: { color: GRID },
          ticks: { display: false },
          title: { display: false },
        },
      },
    },
  };
}

// Horizontal tree: root -> branches -> leaf categories.
function buildTaxonomyConfig() {
  const nodeData = [
    { ...TAXONOMY_ROOT, label: TAXONOMY_ROOT.label },
    ...TAXONOMY_BRANCHES.map((b) => ({ x: b.x, y: b.y, label: b.label })),
    ...TAXONOMY_BRANCHES.flatMap((b) =>
      b.children.map((c) => ({ x: c.x, y: c.y, label: c.label }))
    ),
  ];
  const edges = [
    // root -> each branch
    ...TAXONOMY_BRANCHES.map((b) => [{ x: TAXONOMY_ROOT.x, y: TAXONOMY_ROOT.y }, { x: b.x, y: b.y }]),
    // branch -> each child
    ...TAXONOMY_BRANCHES.flatMap((b) =>
      b.children.map((c) => [{ x: b.x, y: b.y }, { x: c.x, y: c.y }])
    ),
  ];
  return {
    type: "scatter" as const,
    data: {
      datasets: [
        ...edges.map((e) => ({
          label: "",
          data: e,
          showLine: true,
          tension: 0,
          borderColor: "rgba(126, 167, 255, 0.45)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        })),
        {
          label: "Cybercrime categories",
          data: nodeData,
          pointBackgroundColor: TIMELINE,
          pointBorderColor: INK,
          pointBorderWidth: 2,
          pointRadius: 7,
          pointHoverRadius: 10,
          pointHoverBackgroundColor: BARS_HOVER,
        },
      ],
    },
    options: {
      ...diagramBase(),
      plugins: {
        ...diagramBase().plugins,
        tooltip: {
          ...diagramBase().plugins.tooltip,
          callbacks: {
            title: (items: { raw: { label: string } }[]) =>
              items.length ? items[0].raw.label : "",
            label: () => "",
          },
        },
        datalabels: {
          formatter: (v: { label: string }) => v.label,
          anchor: "center" as const,
          align: "end" as const,
          offset: 8,
          color: INK,
          font: { size: 10.5, weight: "500" as const },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: -0.6,
          max: 2.7,
          border: { display: false },
          grid: { display: false },
          ticks: { display: false },
          title: { display: false },
        },
        y: {
          type: "linear" as const,
          min: -3.6,
          max: 3.6,
          border: { display: false },
          grid: { display: false },
          ticks: { display: false },
          title: { display: false },
        },
      },
    },
  };
}

// Routine activity triangle: offender + target + (absent) guardian -> crime.
function buildRoutineConfig() {
  const [offender, target, guardian, crime] = ROUTINE_NODES;
  const edges = [
    [{ x: offender.x, y: offender.y }, { x: crime.x, y: crime.y }],
    [{ x: target.x, y: target.y }, { x: crime.x, y: crime.y }],
    [{ x: guardian.x, y: guardian.y }, { x: crime.x, y: crime.y }],
  ];
  return {
    type: "scatter" as const,
    data: {
      datasets: [
        ...edges.map((e) => ({
          label: "",
          data: e,
          showLine: true,
          tension: 0,
          borderColor: "rgba(126, 167, 255, 0.5)",
          borderWidth: 2,
          pointRadius: 0,
          pointHoverRadius: 0,
          fill: false,
        })),
        {
          label: "Routine activity theory",
          data: ROUTINE_NODES.map((n) => ({ x: n.x, y: n.y, label: n.label, role: n.role })),
          pointBackgroundColor: (ctx: { dataIndex: number }) =>
            ctx.dataIndex === 3 ? BARS_HOVER : TIMELINE,
          pointBorderColor: INK,
          pointBorderWidth: 2,
          pointRadius: 9,
          pointHoverRadius: 13,
        },
      ],
    },
    options: {
      ...diagramBase(),
      plugins: {
        ...diagramBase().plugins,
        tooltip: {
          ...diagramBase().plugins.tooltip,
          callbacks: {
            title: (items: { raw: { label: string } }[]) =>
              items.length ? items[0].raw.label : "",
            label: (ctx: { raw: { role: string } }) => ctx.raw.role,
          },
        },
        datalabels: {
          formatter: (v: { label: string }) => v.label,
          anchor: "center" as const,
          align: (ctx: { dataIndex: number }) =>
            ctx.dataIndex === 3 ? ("center" as const) : ("end" as const),
          offset: 8,
          color: INK,
          font: { size: 11, weight: "600" as const },
        },
      },
      scales: {
        x: {
          type: "linear" as const,
          min: -2.3,
          max: 2.3,
          border: { display: false },
          grid: { display: false },
          ticks: { display: false },
          title: { display: false },
        },
        y: {
          type: "linear" as const,
          min: -1.8,
          max: 2.2,
          border: { display: false },
          grid: { display: false },
          ticks: { display: false },
          title: { display: false },
        },
      },
    },
  };
}
