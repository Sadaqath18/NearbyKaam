import React, { useState } from "react";
import { Job } from "../types";
import { speakText, stopSpeaking } from "../services/geminiService";
import { getPromotionPlanExplanation } from "../services/geminiService";

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

  const explainPlans = () => {
    const plan = plans.find((p) => p.id === selectedPlan);

    let message = "";

    if (plan) {
      message = `The ${plan.radiusKm} kilometer plan costs rupees ${plan.price}. It will boost your job visibility to workers within ${plan.radiusKm} kilometers.`;
    } else {
      message =
        "You can promote your job using different radius plans. Five kilometer for rupees 199, ten kilometer for rupees 299, twenty kilometer for rupees 399 which is the most popular, and thirty kilometer for rupees 499.";
    }

    const [isSpeaking, setIsSpeaking] = useState(false);

    const explainPlans = async () => {
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
        return;
      }

      try {
        setIsSpeaking(true);
        const script = await getPromotionPlanExplanation(
          plans,
          plans.find((p) => p.id === selectedPlan)?.radiusKm,
        );
        await speakText(script, "en");
      } catch (err) {
        console.error(err);
      } finally {
        setIsSpeaking(false);
      }
    };
  };

  return (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
      {/* HEADER */}
      <div className="px-6 pt-12 pb-6 bg-white border-b-2 border-slate-200 flex items-center gap-4">
        <button
          title="Back to Promote Jobs"
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
            <h3 className="text-2xl font-black text-slate-900">
              Boost Your Reach
            </h3>
            <p className="text-[11px] font-bold text-slate-400 mt-1">
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
                Promoting Now
              </p>
              <p className="font-black text-slate-900 truncate">
                {job.jobRole}
              </p>
              <p className="text-[10px] font-bold text-slate-400 truncate">
                {job.location.address}
              </p>
            </div>
          </div>

          {/* PLANS */}
          <div className="space-y-4">
            {plans.map((plan) => {
              const isSelected = selectedPlan === plan.id;

              return (
                <div
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative bg-white rounded-[28px] border-2 p-5 cursor-pointer transition-all ${
                    isSelected
                      ? "border-indigo-600 shadow-lg"
                      : "border-slate-200"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 right-4 bg-yellow-400 text-black text-[9px] font-black px-3 py-1 rounded-full uppercase">
                      Popular Choice
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <i className="fa-solid fa-location-crosshairs"></i>
                      </div>
                      <div>
                        <p className="font-black text-slate-900">
                          {plan.radiusKm} KM Radius
                        </p>
                        <p className="text-[10px] font-bold text-slate-400">
                          One-time
                        </p>
                      </div>
                    </div>
                    <p className="text-xl font-black text-slate-900">
                      ₹{plan.price}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy(plan.id);
                    }}
                    className="mt-4 w-full py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] active:scale-95 transition-all"
                  >
                    Buy Now
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STICKY VOICE ASSISTANT */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 w-full px-6 z-50">
        <button
          onClick={explainPlans}
          className="w-full bg-indigo-600 text-white py-4 rounded-full font-black flex items-center justify-center gap-3 shadow-2xl"
        >
          <i className="fa-solid fa-microphone"></i>
          Ask NearbyKaam Assistant
        </button>
      </div>
    </div>
  );
};

export default PromoteJobView;
