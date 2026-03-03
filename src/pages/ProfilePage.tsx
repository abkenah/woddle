import { useState, useRef } from 'react';
import {
  User,
  Camera,
  X,
  Save,
  LogOut,
  Timer,
  Dumbbell,
  Trophy,
  Search,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../store/AppContext';
import { CROSSFIT_MOVEMENTS, Division, Gender, LookingFor, UserProfile } from '../types';
import { GYMS } from '../data/mockData';
import { rankingLabel } from '../utils/matching';

export default function ProfilePage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const currentUser = state.currentUser!;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<UserProfile>({ ...currentUser });
  const [gymSearch, setGymSearch] = useState('');
  const [showGymPicker, setShowGymPicker] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function updateDraft(updates: Partial<UserProfile>) {
    setDraft((d) => ({ ...d, ...updates }));
  }

  function handleSave() {
    dispatch({ type: 'UPDATE_PROFILE', updates: draft });
    setEditing(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function handleCancel() {
    setDraft({ ...currentUser });
    setEditing(false);
  }

  function handleLogout() {
    dispatch({ type: 'LOGOUT' });
    localStorage.removeItem('rx-match-state');
    navigate('/');
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - draft.photos.length;
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const url = ev.target?.result as string;
        setDraft((d) => ({ ...d, photos: [...d.photos, url].slice(0, 5) }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setDraft((d) => ({
      ...d,
      photos: d.photos.filter((_, i) => i !== idx),
    }));
  }

  const filteredGyms = GYMS.filter(
    (g) =>
      g.name.toLowerCase().includes(gymSearch.toLowerCase()) ||
      g.city.toLowerCase().includes(gymSearch.toLowerCase())
  );

  const divisionColors: Record<string, string> = {
    beginner: 'text-zinc-400',
    scaled: 'text-blue-400',
    rx: 'text-orange-400',
    elite: 'text-yellow-400',
  };

  const lookingForLabels: Record<LookingFor, string> = {
    romantic: '❤️ Romantic',
    competition: '🏆 Competition Partner',
    both: '🔥 Both',
  };

  return (
    <div className="min-h-screen bg-zinc-950 pt-12 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between px-5 mb-6">
        <div className="flex items-center gap-2">
          <User size={22} className="text-orange-500" />
          <h1 className="text-xl font-black text-white">My Profile</h1>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <button
                onClick={handleCancel}
                className="px-3 py-1.5 rounded-lg text-sm text-zinc-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-orange-500 text-white text-sm font-semibold hover:bg-orange-400 transition-colors"
              >
                <Save size={14} />
                Save
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="px-4 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 text-sm font-medium transition-colors"
            >
              Edit
            </button>
          )}
        </div>
      </div>

      {saved && (
        <div className="mx-5 mb-4 flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/30 rounded-xl">
          <Check size={16} className="text-green-400" />
          <p className="text-green-400 text-sm font-medium">Profile saved!</p>
        </div>
      )}

      <div className="px-5 space-y-6">
        {/* ── Photos ───────────────────────────── */}
        <div>
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Photos
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {draft.photos.map((photo, idx) => (
              <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800">
                <img src={photo} alt="" className="w-full h-full object-cover" />
                {editing && (
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/70 rounded-full p-0.5"
                  >
                    <X size={12} className="text-white" />
                  </button>
                )}
                {idx === 0 && (
                  <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1 py-0.5 rounded">
                    MAIN
                  </span>
                )}
              </div>
            ))}

            {editing && draft.photos.length < 5 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-600 hover:border-orange-500 transition-colors flex flex-col items-center justify-center gap-1.5 text-zinc-500 hover:text-orange-400"
              >
                <Camera size={20} />
                <span className="text-[10px] font-medium">Add</span>
              </button>
            )}

            {draft.photos.length === 0 && !editing && (
              <div className="aspect-[3/4] rounded-xl bg-zinc-800 flex flex-col items-center justify-center gap-2 col-span-1">
                <Camera size={24} className="text-zinc-600" />
                <span className="text-xs text-zinc-600">No photos</span>
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handlePhotoUpload}
          />
        </div>

        {/* ── Basic Info ───────────────────────── */}
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            Basic Info
          </h2>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Name</label>
              {editing ? (
                <input
                  className="input-field"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
              ) : (
                <p className="text-white font-medium">{currentUser.name}</p>
              )}
            </div>
            <div>
              <label className="label">Age</label>
              {editing ? (
                <input
                  className="input-field"
                  type="number"
                  min={18}
                  value={draft.age}
                  onChange={(e) => updateDraft({ age: parseInt(e.target.value) })}
                />
              ) : (
                <p className="text-white font-medium">{currentUser.age}</p>
              )}
            </div>
          </div>

          <div>
            <label className="label">Bio</label>
            {editing ? (
              <textarea
                className="input-field resize-none"
                rows={4}
                value={draft.bio}
                onChange={(e) => updateDraft({ bio: e.target.value })}
                maxLength={500}
                placeholder="Tell potential matches about yourself..."
              />
            ) : (
              <p className="text-zinc-300 text-sm leading-relaxed">
                {currentUser.bio || <span className="text-zinc-600">No bio yet</span>}
              </p>
            )}
          </div>

          <div>
            <label className="label">I am</label>
            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female', 'non-binary', 'other'] as Gender[]).map((g) => (
                  <button
                    key={g}
                    onClick={() => updateDraft({ gender: g })}
                    className={`py-2 rounded-xl border text-sm font-medium capitalize transition-colors ${
                      draft.gender === g
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white font-medium capitalize">{currentUser.gender}</p>
            )}
          </div>

          <div>
            <label className="label">Interested in</label>
            {editing ? (
              <div className="grid grid-cols-2 gap-2">
                {(['male', 'female', 'non-binary', 'other'] as Gender[]).map((g) => {
                  const selected = draft.interestedIn.includes(g);
                  return (
                    <button
                      key={g}
                      onClick={() =>
                        updateDraft({
                          interestedIn: selected
                            ? draft.interestedIn.filter((x) => x !== g)
                            : [...draft.interestedIn, g],
                        })
                      }
                      className={`py-2 rounded-xl border text-sm font-medium capitalize transition-colors flex items-center justify-between px-3 ${
                        selected
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                      }`}
                    >
                      {g}
                      {selected && <Check size={13} />}
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-white font-medium capitalize">
                {currentUser.interestedIn.join(', ')}
              </p>
            )}
          </div>

          <div>
            <label className="label">Looking for</label>
            {editing ? (
              <div className="space-y-2">
                {(['romantic', 'competition', 'both'] as LookingFor[]).map((opt) => (
                  <button
                    key={opt}
                    onClick={() => updateDraft({ lookingFor: opt })}
                    className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                      draft.lookingFor === opt
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {lookingForLabels[opt]}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-white font-medium">
                {lookingForLabels[currentUser.lookingFor]}
              </p>
            )}
          </div>
        </div>

        {/* ── CrossFit Stats ───────────────────── */}
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            CrossFit Profile
          </h2>

          {/* Home gym */}
          <div>
            <label className="label">Home Gym</label>
            {editing ? (
              <div className="relative">
                <button
                  onClick={() => setShowGymPicker((v) => !v)}
                  className="input-field flex items-center justify-between text-left"
                >
                  <span className={draft.homeGym ? 'text-white' : 'text-zinc-500'}>
                    {draft.homeGym ? draft.homeGym.name : 'Select a gym'}
                  </span>
                  <ChevronDown size={16} className="text-zinc-500" />
                </button>
                {showGymPicker && (
                  <div className="absolute left-0 right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-xl overflow-hidden z-20 shadow-xl">
                    <div className="p-2">
                      <div className="relative">
                        <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg pl-8 pr-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                          placeholder="Search..."
                          value={gymSearch}
                          onChange={(e) => setGymSearch(e.target.value)}
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="max-h-48 overflow-y-auto no-scrollbar">
                      {filteredGyms.map((gym) => (
                        <button
                          key={gym.id}
                          onClick={() => {
                            updateDraft({ homeGym: gym });
                            setShowGymPicker(false);
                            setGymSearch('');
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-700 flex items-center justify-between"
                        >
                          <span className="text-white">{gym.name}</span>
                          <span className="text-zinc-500 text-xs">{gym.city}, {gym.state}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-white font-medium">
                {currentUser.homeGym?.name ?? <span className="text-zinc-600">Not set</span>}
              </p>
            )}
          </div>

          {/* Division */}
          <div>
            <label className="label">Division</label>
            {editing ? (
              <div className="grid grid-cols-4 gap-2">
                {(['beginner', 'scaled', 'rx', 'elite'] as Division[]).map((d) => (
                  <button
                    key={d}
                    onClick={() => updateDraft({ division: d })}
                    className={`py-2 rounded-xl border text-xs font-semibold capitalize transition-colors ${
                      draft.division === d
                        ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                        : 'border-zinc-700 text-zinc-400 hover:border-zinc-600'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            ) : (
              <p className={`font-semibold capitalize ${divisionColors[currentUser.division]}`}>
                {currentUser.division}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label flex items-center gap-1">
                <Timer size={13} className="text-orange-400" /> Fran time
              </label>
              {editing ? (
                <input
                  className="input-field"
                  placeholder="mm:ss"
                  value={draft.franTime ?? ''}
                  onChange={(e) => updateDraft({ franTime: e.target.value || null })}
                />
              ) : (
                <p className="text-white font-medium">
                  {currentUser.franTime ?? <span className="text-zinc-600">—</span>}
                </p>
              )}
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Trophy size={13} className="text-yellow-400" /> CF Ranking
              </label>
              {editing ? (
                <input
                  className="input-field"
                  type="number"
                  placeholder="e.g. 8500"
                  value={draft.crossfitRanking ?? ''}
                  onChange={(e) =>
                    updateDraft({ crossfitRanking: parseInt(e.target.value) || null })
                  }
                />
              ) : (
                <p className="text-white font-medium text-xs">
                  {currentUser.crossfitRanking
                    ? rankingLabel(currentUser.crossfitRanking)
                    : <span className="text-zinc-600">—</span>}
                </p>
              )}
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Dumbbell size={13} className="text-blue-400" /> Back Squat
              </label>
              {editing ? (
                <input
                  className="input-field"
                  type="number"
                  placeholder="lbs"
                  value={draft.backSquat1RM ?? ''}
                  onChange={(e) =>
                    updateDraft({ backSquat1RM: parseInt(e.target.value) || null })
                  }
                />
              ) : (
                <p className="text-white font-medium">
                  {currentUser.backSquat1RM
                    ? `${currentUser.backSquat1RM} lbs`
                    : <span className="text-zinc-600">—</span>}
                </p>
              )}
            </div>
            <div>
              <label className="label flex items-center gap-1">
                <Dumbbell size={13} className="text-purple-400" /> Deadlift
              </label>
              {editing ? (
                <input
                  className="input-field"
                  type="number"
                  placeholder="lbs"
                  value={draft.deadlift1RM ?? ''}
                  onChange={(e) =>
                    updateDraft({ deadlift1RM: parseInt(e.target.value) || null })
                  }
                />
              ) : (
                <p className="text-white font-medium">
                  {currentUser.deadlift1RM
                    ? `${currentUser.deadlift1RM} lbs`
                    : <span className="text-zinc-600">—</span>}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── Movements ───────────────────────── */}
        <div className="card p-4 space-y-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide">
            Movements
          </h2>
          <div>
            <label className="label">❤️ Favorite movement</label>
            {editing ? (
              <select
                className="input-field"
                value={draft.favoriteMovement}
                onChange={(e) => updateDraft({ favoriteMovement: e.target.value })}
              >
                {CROSSFIT_MOVEMENTS.map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <span className="badge bg-green-900/50 text-green-300 border border-green-800 text-sm py-1 px-3">
                {currentUser.favoriteMovement}
              </span>
            )}
          </div>
          <div>
            <label className="label">😅 Least favorite</label>
            {editing ? (
              <select
                className="input-field"
                value={draft.leastFavoriteMovement}
                onChange={(e) => updateDraft({ leastFavoriteMovement: e.target.value })}
              >
                {CROSSFIT_MOVEMENTS.filter((m) => m !== draft.favoriteMovement).map((m) => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            ) : (
              <span className="badge bg-red-900/50 text-red-300 border border-red-800 text-sm py-1 px-3">
                {currentUser.leastFavoriteMovement}
              </span>
            )}
          </div>
        </div>

        {/* ── Stats summary ───────────────────── */}
        <div className="card p-4">
          <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
            Activity
          </h2>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="text-2xl font-black text-white">
                {state.swipes.filter((s) => s.type === 'romantic').length}
              </p>
              <p className="text-xs text-zinc-500">Romantic Swipes</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {state.matches.filter((m) => m.type === 'romantic').length}
              </p>
              <p className="text-xs text-zinc-500">Matches</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">
                {state.matches.filter((m) => m.type === 'competition').length}
              </p>
              <p className="text-xs text-zinc-500">Partners</p>
            </div>
          </div>
        </div>

        {/* ── Logout ───────────────────────────── */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
        >
          <LogOut size={16} />
          Log out
        </button>
      </div>
    </div>
  );
}
