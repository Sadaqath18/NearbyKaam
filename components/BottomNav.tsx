const BottomNav = ({ active, onChange }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white border-t flex justify-around py-3">
    <button onClick={() => onChange("HOME")}>🏠 Home</button>
    <button onClick={() => onChange("JOBS")}>💼 Jobs</button>
    <button onClick={() => onChange("PROFILE")}>👤 Profile</button>
  </div>
);
