"use client";

import { useEffect, useState } from "react";

type TrainingState = "idle" | "running" | "done";

export default function ModelsPage() {
	const [state, setState] = useState<TrainingState>("idle");
	const [progress, setProgress] = useState(0);
	const [metrics, setMetrics] = useState<{ accuracy: string; loss: string }>({ accuracy: "0.00", loss: "0.00" });

	useEffect(() => {
		if (state !== "running") return;

		let current = 0;
		const intervalId = window.setInterval(() => {
			const increment = Math.max(1, Math.round(Math.random() * 3));
			current = Math.min(100, current + increment);
			setProgress(current);

			if (current >= 100) {
				window.clearInterval(intervalId);
				setMetrics({
					accuracy: (92 + Math.random() * 6).toFixed(2),
					loss: (0.3 + Math.random() * 0.2).toFixed(3),
				});
				setState("done");
			}
		}, 140);

		return () => window.clearInterval(intervalId);
	}, [state]);

	const handleStart = () => {
		if (state === "running") return;
		setProgress(0);
		setMetrics({ accuracy: "0.00", loss: "0.00" });
		setState("running");
	};
	return (
		<div className="min-h-screen bg-white text-slate-900">
			<main className="mx-auto flex min-h-screen max-w-4xl flex-col gap-10 px-6 py-16">
				<section className="space-y-6">
					<p className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-500">
						<span className="h-1.5 w-1.5 rounded-full bg-blue-500" />
						Model Control Center
					</p>
				</section>

				<section className="grid gap-8 lg:grid-cols-[1.2fr_1fr]">
					<div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
						<div className="space-y-8">
							<div className="flex items-center justify-between">
								<span className="text-sm font-medium uppercase tracking-[0.25em] text-slate-500">Training Status</span>
								<span
									className={`flex items-center gap-2 rounded-full px-3 py-1 text-sm ${
										state === "running" ? "bg-blue-50 text-blue-600" : "bg-slate-100 text-slate-600"
									}`}
								>
									<span
										className={`h-2 w-2 rounded-full ${
											state === "running" ? "bg-blue-500 animate-ping" : state === "done" ? "bg-green-500" : "bg-slate-400"
										}`}
									/>
									{state === "running" ? "Processing" : state === "done" ? "Completed" : "Idle"}
								</span>
							</div>

							<div className="space-y-4">
								<div className="flex items-center justify-between text-xs uppercase text-slate-500">
									<span>Overall Progress</span>
									<span>{progress}%</span>
								</div>
								<div className="h-4 rounded-full bg-slate-100">
									<div
										className="h-full rounded-full bg-blue-600 transition-all duration-200"
										style={{ width: `${progress}%` }}
									/>
								</div>
							</div>
						</div>
					</div>

					<div className="flex h-full flex-col justify-between gap-8 rounded-3xl border border-slate-200 bg-slate-50 p-8">
						<div className="space-y-4">
							<h2 className="text-2xl font-semibold text-slate-900">Control</h2>
						</div>

						<div className="space-y-6">
							{state === "done" && (
								<div className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm text-slate-700">
									<p className="text-xs uppercase tracking-[0.25em] text-slate-500">Latest Metrics</p>
									<div className="mt-2 flex items-center justify-between">
										<span className="font-semibold text-slate-900">Accuracy</span>
										<span>{metrics.accuracy}%</span>
									</div>
									<div className="flex items-center justify-between text-slate-700">
										<span className="font-semibold text-slate-900">Loss</span>
										<span>{metrics.loss}</span>
									</div>
								</div>
							)}

							<button
								onClick={handleStart}
								disabled={state === "running"}
								className={`inline-flex w-full items-center justify-center rounded-2xl border px-5 py-3 text-base font-semibold transition focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-300 ${
									state === "running"
										? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
										: "border-blue-600 bg-blue-600 text-white shadow-sm hover:bg-blue-700"
								}`}
							>
								{state === "running" ? "Training in progress" : state === "done" ? "Run again" : "Start training"}
							</button>
						</div>
					</div>
				</section>
			</main>
		</div>
	);
}
