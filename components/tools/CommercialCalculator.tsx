"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs-primitive";
import { Calculator, TrendingUp, DollarSign, Percent, BarChart3 } from "lucide-react";

export function CommercialCalculator() {
    const [noi, setNoi] = useState({ revenue: "", expenses: "" });
    const [capRate, setCapRate] = useState({ noi: "", value: "" });
    const [roi, setRoi] = useState({ investment: "", finalValue: "" });
    const [dscr, setDscr] = useState({ noi: "", debt: "" });

    const [results, setResults] = useState({
        noi: 0,
        capRate: 0,
        roi: 0,
        dscr: 0,
    });

    useEffect(() => {
        const calculatedNoi = parseFloat(noi.revenue || "0") - parseFloat(noi.expenses || "0");
        const calculatedCapRate = (parseFloat(capRate.noi || "0") / parseFloat(capRate.value || "1")) * 100;
        const calculatedRoi = ((parseFloat(roi.finalValue || "0") - parseFloat(roi.investment || "1")) / parseFloat(roi.investment || "1")) * 100;
        const calculatedDscr = parseFloat(dscr.noi || "0") / parseFloat(dscr.debt || "1");

        setResults({
            noi: calculatedNoi,
            capRate: isFinite(calculatedCapRate) ? calculatedCapRate : 0,
            roi: isFinite(calculatedRoi) ? calculatedRoi : 0,
            dscr: isFinite(calculatedDscr) ? calculatedDscr : 0,
        });
    }, [noi, capRate, roi, dscr]);

    const formatCurrency = (val: number) =>
        new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="text-center space-y-2">
                <h2 className="text-3xl font-black uppercase tracking-tighter text-slate-900 dark:text-white flex items-center justify-center gap-3">
                    <Calculator className="h-8 w-8 text-elite-accent-cyan" />
                    Commercial Intelligence Hub
                </h2>
                <p className="text-slate-500 dark:text-slate-400 font-medium uppercase text-xs tracking-[0.2em]">
                    Professional Financial Analysis Toolset
                </p>
            </div>

            <Tabs defaultValue="noi" className="w-full">
                <TabsList className="grid grid-cols-4 bg-slate-100 dark:bg-white/5 p-1 rounded-2xl mb-8">
                    <TabsTrigger value="noi" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-elite-accent-cyan dark:data-[state=active]:text-black transition-all font-black uppercase text-[10px] tracking-widest gap-2">
                        <DollarSign className="h-3.5 w-3.5" />
                        NOI
                    </TabsTrigger>
                    <TabsTrigger value="cap" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-elite-accent-emerald dark:data-[state=active]:text-black transition-all font-black uppercase text-[10px] tracking-widest gap-2">
                        <Percent className="h-3.5 w-3.5" />
                        Cap Rate
                    </TabsTrigger>
                    <TabsTrigger value="roi" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-elite-accent-purple dark:data-[state=active]:text-black transition-all font-black uppercase text-[10px] tracking-widest gap-2">
                        <TrendingUp className="h-3.5 w-3.5" />
                        ROI
                    </TabsTrigger>
                    <TabsTrigger value="dscr" className="rounded-xl data-[state=active]:bg-white dark:data-[state=active]:bg-amber-400 dark:data-[state=active]:text-black transition-all font-black uppercase text-[10px] tracking-widest gap-2">
                        <BarChart3 className="h-3.5 w-3.5" />
                        DSCR
                    </TabsTrigger>
                </TabsList>

                <div className="grid md:grid-cols-2 gap-8">
                    <Card className="glass-card-premium border-white/10 shadow-2xl overflow-hidden rounded-[2rem]">
                        <CardHeader className="bg-white/5 border-b border-white/5 p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-widest">Input Parameters</CardTitle>
                            <CardDescription className="text-xs uppercase font-medium tracking-wider text-slate-500">Configure your financial data</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8">
                            <TabsContent value="noi" className="m-0 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Gross Operating Income</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter total revenue"
                                        value={noi.revenue}
                                        onChange={(e) => setNoi({ ...noi, revenue: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-cyan/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Operating Expenses</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter total expenses"
                                        value={noi.expenses}
                                        onChange={(e) => setNoi({ ...noi, expenses: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-cyan/50"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="cap" className="m-0 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Net Operating Income</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter annual NOI"
                                        value={capRate.noi}
                                        onChange={(e) => setCapRate({ ...capRate, noi: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-emerald/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Asset Value / Sale Price</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter property value"
                                        value={capRate.value}
                                        onChange={(e) => setCapRate({ ...capRate, value: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-emerald/50"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="roi" className="m-0 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Initial Investment</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter total cost"
                                        value={roi.investment}
                                        onChange={(e) => setRoi({ ...roi, investment: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-purple/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Final Asset Value</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter eventual exit value"
                                        value={roi.finalValue}
                                        onChange={(e) => setRoi({ ...roi, finalValue: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-elite-accent-purple/50"
                                    />
                                </div>
                            </TabsContent>

                            <TabsContent value="dscr" className="m-0 space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Net Operating Income</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter NOI"
                                        value={dscr.noi}
                                        onChange={(e) => setDscr({ ...dscr, noi: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-amber-400/50"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Annual Debt Service</label>
                                    <Input
                                        type="number"
                                        placeholder="Enter total loan payments"
                                        value={dscr.debt}
                                        onChange={(e) => setDscr({ ...dscr, debt: e.target.value })}
                                        className="bg-white/5 border-white/10 rounded-xl h-12 px-4 focus:ring-2 focus:ring-amber-400/50"
                                    />
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>

                    <Card className="glass-card-premium border-white/10 shadow-2xl overflow-hidden rounded-[2rem] bg-elite-bg/40 relative">
                        <div className="absolute top-0 right-0 p-4 opacity-5">
                            <Calculator className="h-32 w-32" />
                        </div>
                        <CardHeader className="p-8">
                            <CardTitle className="text-xl font-black uppercase tracking-widest">Real-Time Analysis</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex flex-col justify-center h-full space-y-12">
                            <TabsContent value="noi" className="m-0">
                                <div className="text-center space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-cyan">Net Operating Income</span>
                                    <div className="text-5xl font-black tracking-tighter tabular-nums">
                                        {formatCurrency(results.noi)}
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase font-bold px-8">The total income generated from the property after deducting all operating expenses.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="cap" className="m-0">
                                <div className="text-center space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-emerald">Capitalization Rate</span>
                                    <div className="text-6xl font-black tracking-tighter tabular-nums">
                                        {results.capRate.toFixed(2)}%
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase font-bold px-8">The rate of return on a real estate investment property based on the income that the property is expected to generate.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="roi" className="m-0">
                                <div className="text-center space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-elite-accent-purple">Return on Investment</span>
                                    <div className="text-6xl font-black tracking-tighter tabular-nums text-slate-900 dark:text-white">
                                        {results.roi.toFixed(2)}%
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase font-bold px-8">The efficiency of an investment or to compare the efficiencies of several different investments.</p>
                                </div>
                            </TabsContent>

                            <TabsContent value="dscr" className="m-0">
                                <div className="text-center space-y-4">
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-amber-400">Debt Service Coverage</span>
                                    <div className="text-6xl font-black tracking-tighter tabular-nums">
                                        {results.dscr.toFixed(2)}x
                                    </div>
                                    <p className="text-xs text-slate-500 uppercase font-bold px-8">A measure of the cash flow available to pay current debt obligations. Ideal ratio is {">"} 1.25x.</p>
                                </div>
                            </TabsContent>
                        </CardContent>
                    </Card>
                </div>
            </Tabs>

            <div className="flex items-center justify-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-500 pt-8 border-t border-white/5">
                <span>Financial Protocol Alpha</span>
                <span className="h-1 w-1 bg-slate-500 rounded-full" />
                <span>Secure Local Execution</span>
                <span className="h-1 w-1 bg-slate-500 rounded-full" />
                <span>Refectl Relay Tools</span>
            </div>
        </div>
    );
}
