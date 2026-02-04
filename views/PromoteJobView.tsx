import React, { useState } from "react";
import { Job } from "../types";
import {
  speakText,
  stopSpeaking,
  getPromotionPlanExplanation,
} from "../services/geminiService";

export interface PromotionPlan {
  id: string;
  radiusKm: number;
  price: number;
  popular?: boolean;
}

interface Props {
  job: Job;
  plans: PromotionPlan[];
  onBack: () => void;
  onBuy: (planId: string) => void;
}

const PromoteJobView: React.FC<Props> = ({ job, plans, onBack, onBuy }) => {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  /* 🎙 VOICE EXPLAINER (READ ONLY) */
  const explainPlans = async () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    try {
      setIsSpeaking(true);

      const radius = plans.find((p) => p.id === selectedPlan)?.radiusKm;

      const script = await getPromotionPlanExplanation(plans, radius);
      await speakText(script, "en");
    } catch (err) {
      console.error(err);
    } finally {
      setIsSpeaking(false);
    }
  };

  return (
    <div
      className="flex-1 flex flex-col bg-slate-50 overflow-y-auto
"
    >
      {/* HEADER */}
      <div className="px-6 pt-12 pb-6 bg-white border-b-2 border-slate-200 flex items-center gap-4">
        <button
          title="Back to job details"
          onClick={onBack}
          className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center"
        >
          <i className="fa-solid fa-arrow-left"></i>
        </button>
        <h2 className="text-lg font-black">Promote Job</h2>
      </div>

      {/* SCROLLABLE CONTENT */}
      <div className="flex-1 overflow-y-auto pb-48">
        <div className="p-6 space-y-6">
          {/* TITLE */}
          <div>
            <h3 className="text-2xl font-black">Boost Your Reach</h3>
            <p className="text-[11px] font-bold text-slate-400">
              Get more local applications instantly
            </p>
          </div>

          {/* JOB SUMMARY */}
          <div className="bg-white border-2 border-slate-200 rounded-[28px] p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <i className="fa-solid fa-briefcase"></i>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-indigo-600 uppercase">
                Promoting
              </p>
              <p className="font-black truncate">{job.jobRole}</p>
              <p className="text-[10px] text-slate-400 truncate">
                {job.location.address}
              </p>
            </div>
          </div>

          {/* PLANS */}
          <div className="space-y-4">
            {plans.map((plan) => {
              const active = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative bg-white rounded-[28px] border-2 p-5 cursor-pointer ${
                    active ? "border-indigo-600 shadow-lg" : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-4 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full">
                      Popular
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-black">{plan.radiusKm} KM Radius</p>
                      <p className="text-[10px] text-slate-400">
                        One-time boost
                      </p>
                    </div>
                    <p className="text-xl font-black">₹{plan.price}</p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy(plan.id);
                    }}
                    className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase text-[11px]"
                  >
                    Buy Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 🎙 STICKY VOICE ASSISTANT */}
      <div className="absolute bottom-16 left-0 right-0 px-6">
        <button
          onClick={explainPlans}
          className={`w-full py-4 rounded-full font-black flex items-center justify-center gap-3 shadow-2xl ${
            isSpeaking ? "bg-orange-500 text-white" : "bg-indigo-600 text-white"
          }`}
        >
          <i
            className={`fa-solid ${isSpeaking ? "fa-stop" : "fa-microphone"}`}
          ></i>
          {isSpeaking ? "Stop Explanation" : "Ask NearbyKaam Assistant"}
        </button>
      </div>
    </div>
  );
};

export default PromoteJobView;
