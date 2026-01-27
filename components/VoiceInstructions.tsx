import { speak } from "../voice/speak";
import { useLanguage } from "../context/LanguageContext";

interface Props {
  title: string;
  subtitle?: string;
  text: string;
}

const VoiceInstruction: React.FC<Props> = ({ title, subtitle, text }) => {
  const { language } = useLanguage();

  return (
    <button
      type="button"
      onClick={() => speak(text, language)}
      className="w-full mb-6 flex items-center gap-4 px-5 py-4
        bg-blue-50 border border-blue-200 rounded-2xl
        text-left shadow-sm
        hover:bg-blue-100 active:scale-[0.98] transition"
    >
      <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center">
        <i className="fa-solid fa-microphone"></i>
      </div>

      <div>
        <p className="text-sm font-black text-blue-700">{title}</p>
        {subtitle && (
          <p className="text-[11px] font-bold text-blue-600 opacity-90">
            {subtitle}
          </p>
        )}
      </div>
    </button>
  );
};

export default VoiceInstruction;
