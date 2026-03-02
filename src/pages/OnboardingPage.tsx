import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  ChevronLeft,
  Camera,
  X,
  Check,
  Search,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { CROSSFIT_MOVEMENTS, Division, Gender, LookingFor, UserProfile } from '../types';
import { GYMS } from '../data/mockData';

const TOTAL_STEPS = 7;

export default function OnboardingPage() {
  const { state, dispatch } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Draft profile built across steps
  const [draft, setDraft] = useState<Partial<UserProfile>>({
    name: state.currentUser?.name ?? '',
    age: state.currentUser?.age ?? 25,
    gender: state.currentUser?.gender ?? 'male',
    interestedIn: state.currentUser?.interestedIn ?? ['female'],
    bio: '',
    photos: [],
    homeGym: null,
    franTime: '',
    backSquat1RM: undefined,
    deadlift1RM: undefined,
    crossfitRanking: undefined,
    favoriteMovement: 'Snatch',
    leastFavoriteMovement: 'Burpee',
    lookingFor: 'both',
    division: 'rx',
  });

  const [gymSearch, setGymSearch] = useState('');

  function updateDraft(updates: Partial<UserProfile>) {
    setDraft((d) => ({ ...d, ...updates }));
  }

  function toggleInterest(g: Gender) {
    const cur = draft.interestedIn ?? [];
    if (cur.includes(g)) {
      updateDraft({ interestedIn: cur.filter((x) => x !== g) });
    } else {
      updateDraft({ interestedIn: [...cur, g] });
    }
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const remaining = 5 - (draft.photos?.length ?? 0);
    const toProcess = files.slice(0, remaining);

    toProcess.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        setDraft((d) => ({
          ...d,
          photos: [...(d.photos ?? []), dataUrl].slice(0, 5),
        }));
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  }

  function removePhoto(idx: number) {
    setDraft((d) => ({
      ...d,
      photos: (d.photos ?? []).filter((_, i) => i !== idx),
    }));
  }

  function handleComplete() {
    const finalUser: UserProfile = {
      id: state.currentUser?.id ?? `user-${Date.now()}`,
      name: draft.name ?? 'Athlete',
      age: draft.age ?? 25,
      gender: draft.gender ?? 'male',
      interestedIn: draft.interestedIn ?? ['female'],
      bio: draft.bio ?? '',
      photos: draft.photos ?? [],
      homeGym: draft.homeGym ?? null,
      franTime: draft.franTime || null,
      backSquat1RM: draft.backSquat1RM ?? null,
      deadlift1RM: draft.deadlift1RM ?? null,
      crossfitRanking: draft.crossfitRanking ?? null,
      favoriteMovement: draft.favoriteMovement ?? 'Snatch',
      leastFavoriteMovement: draft.leastFavoriteMovement ?? 'Burpee',
      lookingFor: draft.lookingFor ?? 'both',
      division: draft.division ?? 'rx',
    };
    dispatch({ type: 'COMPLETE_ONBOARDING', user: finalUser });
    navigate('/app/discover');
  }

  const filteredGyms = GYMS.filter(
    (g) =>
      g.name.toLowerCase().includes(gymSearch.toLowerCase()) ||
      g.city.toLowerCase().includes(gymSearch.toLowerCase()) ||
      g.state.toLowerCase().includes(gymSearch.toLowerCase())
  );

  const genders: Gender[] = ['male', 'female', 'non-binary', 'other'];
  const divisions: Division[] = ['beginner', 'scaled', 'rx', 'elite'];
  const lookingForOptions: { value: LookingFor; label: string; desc: string }[] = [
    { value: 'romantic', label: '❤️ Romantic', desc: 'Looking for love & connection' },
    { value: 'competition', label: '🏆 Competition Partner', desc: 'Find a training or comp teammate' },
    { value: 'both', label: '🔥 Both', desc: 'Open to whatever comes' },
  ];

  const canNext = (() => {
    if (step === 1) return !!draft.name && !!draft.age;
    if (step === 4) return (draft.photos?.length ?? 0) > 0;
    return true;
  })();

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 px-5 pt-10 pb-8 max-w-md mx-auto">
      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-zinc-500 mb-2">
          <span>Step {step} of {TOTAL_STEPS}</span>
          <span>{Math.round((step / TOTAL_STEPS) * 100)}%</span>
        </div>
        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 rounded-full transition-all duration-500"
            style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex-1 space-y-6">
        {/* ── Step 1: Basic Info ──────────────── */}
        {step === 1 && (
          <>
            <h2 className="text-2xl font-black text-white">Who are you?</h2>
            <div className="space-y-4">
              <div>
                <label className="label">Your name</label>
                <input
                  className="input-field"
                  placeholder="First name"
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Age</label>
                <input
                  className="input-field"
                  type="number"
                  min={18}
                  max={80}
                  value={draft.age ?? ''}
                  onChange={(e) => updateDraft({ age: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="label">I am</label>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((g) => (
                    <button
                      key={g}
                      onClick={() => updateDraft({ gender: g })}
                      className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors ${
                        draft.gender === g
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="label">Interested in</label>
                <div className="grid grid-cols-2 gap-2">
                  {genders.map((g) => {
                    const selected = (draft.interestedIn ?? []).includes(g);
                    return (
                      <button
                        key={g}
                        onClick={() => toggleInterest(g)}
                        className={`py-2.5 rounded-xl border text-sm font-medium capitalize transition-colors flex items-center justify-between px-3 ${
                          selected
                            ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                            : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                        }`}
                      >
                        {g}
                        {selected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 2: CrossFit Profile ────────── */}
        {step === 2 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">Your CrossFit stats</h2>
              <p className="text-zinc-400 text-sm mt-1">All fields are optional but help us find your best match</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="label">Home CrossFit Gym / Affiliate</label>
                <div className="relative mb-2">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <input
                    className="input-field pl-9"
                    placeholder="Search affiliates..."
                    value={gymSearch}
                    onChange={(e) => setGymSearch(e.target.value)}
                  />
                </div>
                <div className="max-h-40 overflow-y-auto no-scrollbar space-y-1">
                  {filteredGyms.map((gym) => (
                    <button
                      key={gym.id}
                      onClick={() => { updateDraft({ homeGym: gym }); setGymSearch(''); }}
                      className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition-colors ${
                        draft.homeGym?.id === gym.id
                          ? 'bg-orange-500/10 border border-orange-500 text-orange-400'
                          : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-transparent'
                      }`}
                    >
                      <span className="font-medium">{gym.name}</span>
                      <span className="text-zinc-500 ml-2 text-xs">
                        {gym.city}, {gym.state}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Fran time (mm:ss)</label>
                  <input
                    className="input-field"
                    placeholder="e.g. 4:35"
                    value={draft.franTime ?? ''}
                    onChange={(e) => updateDraft({ franTime: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label">CF.com Ranking</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="e.g. 12000"
                    value={draft.crossfitRanking ?? ''}
                    onChange={(e) =>
                      updateDraft({ crossfitRanking: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Back Squat 1RM (lbs)</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="e.g. 275"
                    value={draft.backSquat1RM ?? ''}
                    onChange={(e) =>
                      updateDraft({ backSquat1RM: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
                <div>
                  <label className="label">Deadlift 1RM (lbs)</label>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="e.g. 335"
                    value={draft.deadlift1RM ?? ''}
                    onChange={(e) =>
                      updateDraft({ deadlift1RM: parseInt(e.target.value) || undefined })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="label">Division</label>
                <div className="grid grid-cols-4 gap-2">
                  {divisions.map((d) => (
                    <button
                      key={d}
                      onClick={() => updateDraft({ division: d })}
                      className={`py-2.5 rounded-xl border text-xs font-semibold capitalize transition-colors ${
                        draft.division === d
                          ? 'border-orange-500 bg-orange-500/10 text-orange-400'
                          : 'border-zinc-700 text-zinc-400 hover:border-zinc-500'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── Step 3: Movements ───────────────── */}
        {step === 3 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">Your movements</h2>
              <p className="text-zinc-400 text-sm mt-1">
                We use this to find compatible training partners
              </p>
            </div>
            <div className="space-y-5">
              <div>
                <label className="label">❤️ Favorite movement</label>
                <select
                  className="input-field"
                  value={draft.favoriteMovement}
                  onChange={(e) => updateDraft({ favoriteMovement: e.target.value })}
                >
                  {CROSSFIT_MOVEMENTS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">😅 Least favorite movement</label>
                <select
                  className="input-field"
                  value={draft.leastFavoriteMovement}
                  onChange={(e) => updateDraft({ leastFavoriteMovement: e.target.value })}
                >
                  {CROSSFIT_MOVEMENTS.filter((m) => m !== draft.favoriteMovement).map(
                    (m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    )
                  )}
                </select>
              </div>
            </div>
          </>
        )}

        {/* ── Step 4: Photos ──────────────────── */}
        {step === 4 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">Add your photos</h2>
              <p className="text-zinc-400 text-sm mt-1">
                Upload up to 5 photos. First photo is your main profile pic.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(draft.photos ?? []).map((photo, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-zinc-800">
                  <img
                    src={photo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={() => removePhoto(idx)}
                    className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                  >
                    <X size={14} className="text-white" />
                  </button>
                  {idx === 0 && (
                    <span className="absolute bottom-1 left-1 bg-orange-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                      MAIN
                    </span>
                  )}
                </div>
              ))}

              {(draft.photos?.length ?? 0) < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-[3/4] rounded-xl border-2 border-dashed border-zinc-600
                    hover:border-orange-500 transition-colors flex flex-col items-center
                    justify-center gap-2 text-zinc-500 hover:text-orange-400"
                >
                  <Camera size={24} />
                  <span className="text-xs font-medium">Add photo</span>
                </button>
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

            {(draft.photos?.length ?? 0) === 0 && (
              <p className="text-sm text-yellow-400">
                ⚠️ At least one photo is required to continue.
              </p>
            )}
          </>
        )}

        {/* ── Step 5: Looking For ─────────────── */}
        {step === 5 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">What are you looking for?</h2>
              <p className="text-zinc-400 text-sm mt-1">
                You can change this anytime in your profile
              </p>
            </div>
            <div className="space-y-3">
              {lookingForOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => updateDraft({ lookingFor: opt.value })}
                  className={`w-full text-left p-4 rounded-xl border transition-colors ${
                    draft.lookingFor === opt.value
                      ? 'border-orange-500 bg-orange-500/10'
                      : 'border-zinc-700 bg-zinc-800 hover:border-zinc-600'
                  }`}
                >
                  <div className="font-semibold text-white text-base">{opt.label}</div>
                  <div className="text-zinc-400 text-sm mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {/* ── Step 6: Bio ─────────────────────── */}
        {step === 6 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">Tell your story</h2>
              <p className="text-zinc-400 text-sm mt-1">
                What makes you unique? Brag a little — you've earned it.
              </p>
            </div>
            <div>
              <label className="label">Bio</label>
              <textarea
                className="input-field resize-none"
                rows={5}
                placeholder="e.g. Former swimmer who found CrossFit in 2019. My Fran time is mid but my deadlift is elite. Looking for someone to suffer through long AMRAPs with..."
                value={draft.bio ?? ''}
                onChange={(e) => updateDraft({ bio: e.target.value })}
                maxLength={500}
              />
              <p className="text-xs text-zinc-500 text-right mt-1">
                {(draft.bio?.length ?? 0)}/500
              </p>
            </div>
          </>
        )}

        {/* ── Step 7: Review ──────────────────── */}
        {step === 7 && (
          <>
            <div>
              <h2 className="text-2xl font-black text-white">You're ready! 🔥</h2>
              <p className="text-zinc-400 text-sm mt-1">Review your profile before going live</p>
            </div>

            {(draft.photos?.length ?? 0) > 0 && (
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {draft.photos!.map((p, i) => (
                  <img
                    key={i}
                    src={p}
                    alt=""
                    className="w-24 h-32 object-cover rounded-xl shrink-0 first:border-2 first:border-orange-500"
                  />
                ))}
              </div>
            )}

            <div className="space-y-2 text-sm">
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Name</span>
                <span className="text-white font-medium">{draft.name}, {draft.age}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Gender</span>
                <span className="text-white font-medium capitalize">{draft.gender}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Home Gym</span>
                <span className="text-white font-medium">
                  {draft.homeGym?.name ?? 'Not set'}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Division</span>
                <span className="text-white font-medium capitalize">{draft.division}</span>
              </div>
              {draft.franTime && (
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Fran</span>
                  <span className="text-white font-medium">{draft.franTime}</span>
                </div>
              )}
              {draft.backSquat1RM && (
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Back Squat</span>
                  <span className="text-white font-medium">{draft.backSquat1RM} lbs</span>
                </div>
              )}
              {draft.deadlift1RM && (
                <div className="flex justify-between py-2 border-b border-zinc-800">
                  <span className="text-zinc-400">Deadlift</span>
                  <span className="text-white font-medium">{draft.deadlift1RM} lbs</span>
                </div>
              )}
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Looking for</span>
                <span className="text-white font-medium capitalize">{draft.lookingFor}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-zinc-800">
                <span className="text-zinc-400">Fav movement</span>
                <span className="text-white font-medium">{draft.favoriteMovement}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-zinc-400">Least fav</span>
                <span className="text-white font-medium">{draft.leastFavoriteMovement}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Navigation ─────────────────────────── */}
      <div className="flex gap-3 mt-8">
        {step > 1 && (
          <button
            onClick={() => setStep((s) => s - 1)}
            className="flex items-center gap-1.5 px-5 py-3 rounded-xl border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500 transition-colors text-sm font-medium"
          >
            <ChevronLeft size={16} />
            Back
          </button>
        )}
        <div className="flex-1">
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canNext}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Continue
              <ChevronRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              Start Matching 🔥
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
