import { useMemo, useState, useEffect } from 'react';

// Python Slides – 50Q Interactive Quiz (React + Tailwind)
// Topics: Variables, I/O, Functions, Branching, Errors
// Features: 50-question mixed test, category filters, progress, scoring,
// review missed, show-correct on wrong answer, explanations.

// ---------- Types ----------
type Category = "Variables" | "IO" | "Functions" | "Branching" | "Errors";

type Question = {
  id: string;
  prompt: string;
  code?: string;
  choices: string[]; // exactly 4
  answerIndex: number; // 0..3
  explanation?: string;
  categories: Category[];
};

// ---------- Utils ----------
const uid = () => Math.random().toString(36).slice(2, 10);
function shuffle<T>(list: T[]): T[] { const a = [...list]; for (let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]];} return a; }

// ---------- Question Bank (>=50) ----------
const BANK: Question[] = [
  // Variables / Getting Started
  { id: uid(), prompt: "What type does input() return by default?", choices: ["int","float","str","bool"], answerIndex: 2, explanation: "input() returns a string.", categories: ["IO"] },
  { id: uid(), prompt: "Which is a valid variable name?", choices: ["56_var","var_56","my var","class"], answerIndex: 1, explanation: "Cannot start with digit; no spaces; not a keyword.", categories: ["Variables"] },
  { id: uid(), prompt: "What is printed?", code: "x=5\nx=x+1\nprint(x)", choices: ["5","6","Error","None"], answerIndex: 1, categories: ["Variables"] },
  { id: uid(), prompt: "What does this output?", code: "print('Hello', 'James', '!!', 'Age:', 30)", choices: ["Hello James !! Age: 30","HelloJames!!Age:30","SyntaxError","TypeError"], answerIndex: 0, categories: ["IO"] },
  { id: uid(), prompt: "Chained assignment: a=b=c=5 then print(b)", choices: ["None","5","True","Error"], answerIndex: 1, categories: ["Variables"] },
  { id: uid(), prompt: "Swap variables in Python is commonly written as", choices: ["swap(a,b)","a=b;a=a-b;b=a+b","temp=a;a=b;b=temp","a,b=b,a"], answerIndex: 3, categories: ["Variables"] },
  { id: uid(), prompt: "Which is NOT allowed in variable names?", choices: ["underscore","digits (not first)","space","letters"], answerIndex: 2, categories: ["Variables"] },
  { id: uid(), prompt: "What’s the result of 10 - 4 * 2?", choices: ["12","2","-2","18"], answerIndex: 1, categories: ["Variables"] },
  { id: uid(), prompt: "Re-declaration example: a=100; a='Python'; print(a)", choices: ["100","Python","None","NameError"], answerIndex: 1, categories: ["Variables"] },
  { id: uid(), prompt: "Which is a Python reserved word?", choices: ["sum","data","lambda","index"], answerIndex: 2, categories: ["Variables"] },

  // Branching basics
  { id: uid(), prompt: "What is the result type of a comparison (x < y)?", choices: ["int","bool","str","float"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Equality operator is", choices: ["=","==","!=",">="], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Logical operators include", choices: ["and, or, not","++, --","eq, ne, gt","xor, nand"], answerIndex: 0, categories: ["Branching"] },
  { id: uid(), prompt: "What prints?", code: "a=True\nb=False\nprint(a and b)", choices: ["True","False","1","Error"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Fill: if x>6: print('Greater') else: print('Smaller'); x=3", choices: ["Greater","Smaller","None","Error"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Choose the correct chained comparison for 10 < x < 20", choices: ["if 10 < x < 20:","if 10 < x and < 20:","if x > 10 or < 20:","if x: 10..20"], answerIndex: 0, categories: ["Branching"] },
  { id: uid(), prompt: "Short if-else syntax prints what (x=11,y=10)?", code: "print('X') if x>y else print('Y')", choices: ["X","Y","None","Error"], answerIndex: 0, categories: ["Branching"] },
  { id: uid(), prompt: "Using not: not(4>2) is", choices: ["True","False","None","Error"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Multiple conditions: which is valid?", choices: ["if x > 10 and < 20:","if (x > 10 and x < 20):","if x > 10 or < 20:","if x > 10, x < 20:"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Nested ifs are often", choices: ["Best practice","Bad for readability","Required","Forbidden"], answerIndex: 1, categories: ["Branching"] },

  // Functions
  { id: uid(), prompt: "A function only runs when…", choices: ["It is defined","It is called","Python starts","The file saves"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Basic function def keyword is", choices: ["func","def","define","fn"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Return vs print: a function without explicit return returns", choices: ["0","False","None","''"], answerIndex: 2, categories: ["Functions"] },
  { id: uid(), prompt: "What does len([4,8,9,10]) return?", choices: ["3","4","'4'","TypeError"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Parameters by name example power(y=2, x=3) equals", choices: ["power(2,3)","power(3,2)","Error","power() unsupported"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Which prints 8?", choices: ["power(2,2)","power(2,3)","power(3,3)","power(3,2)"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Docstring purpose is to", choices: ["Speed up code","Describe function","Import modules","Allocate memory"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Function calcSum returns x+y. What is calcSum(3,5)?", choices: ["35","8","'8'","Error"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "max_min should return", choices: ["(max, min)","(min, max)","sum","average"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "sum_of_squares_and_cubes(2,3,4) returns", choices: ["(13, 99)","(29, 99)","(29, 64)","(14, 36)"], answerIndex: 1, categories: ["Functions"] },

  // Errors
  { id: uid(), prompt: "Print(Hi there) raises", choices: ["SyntaxError","NameError","TypeError","No error"], answerIndex: 0, categories: ["Errors"] },
  { id: uid(), prompt: "Undefined variable at runtime causes", choices: ["SyntaxError","NameError","ValueError","IndexError"], answerIndex: 1, categories: ["Errors"] },
  { id: uid(), prompt: "Accessing nums[5] in [1,2,3] raises", choices: ["KeyError","IndexError","TypeError","ValueError"], answerIndex: 1, categories: ["Errors"] },
  { id: uid(), prompt: "int('abc') raises", choices: ["TypeError","ValueError","SyntaxError","ZeroDivisionError"], answerIndex: 1, categories: ["Errors"] },
  { id: uid(), prompt: "Comparing floats with == can fail because", choices: ["Python bug","Precision issues","int casting","Overflow"], answerIndex: 1, categories: ["Errors"] },
  { id: uid(), prompt: "Safer float compare for a-b ≈ 0.2 uses", choices: ["(a-b)==0.2","abs((a-b)-0.2)<1e-7","round(a-b)==0.2","cast to int"], answerIndex: 1, categories: ["Errors"] },
  { id: uid(), prompt: "Logical error means", choices: ["Program crashes","Wrong result but runs","Compiler error","Keyboard error"], answerIndex: 1, categories: ["Errors"] },

  // More branching & mixed
  { id: uid(), prompt: "Given x=10,y=15; y>x and y>20 is", choices: ["True","False","None","Error"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Which executes for x=8?", code: "if x>10: A\nelif x>5: B\nelse: C", choices: ["A","B","C","None"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Short if allowed only when not using", choices: ["elif/else","and/or","input","print"], answerIndex: 0, categories: ["Branching"] },
  { id: uid(), prompt: "not '' evaluates to", choices: ["True","False","''","Error"], answerIndex: 0, categories: ["Branching"] },
  { id: uid(), prompt: "bool(0) is", choices: ["True","False","None","Error"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Guard invalid marks first means", choices: ["Classify then validate","Validate then classify","Skip validation","Use else only"], answerIndex: 1, categories: ["Branching","Errors"] },
  { id: uid(), prompt: "Grade classifier: which order is correct?", choices: ["if >=50; elif >60; elif >=80","if >=80; elif >60; elif >=50","if >=60; elif >=80; else","if >60; elif >=80; elif >=50"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "What prints?", code: "x=10\nif x>5: print('A')\nprint('B')", choices: ["A only","B only","A then B","None"], answerIndex: 2, categories: ["Branching"] },
  { id: uid(), prompt: "True expression is", code: "x,y,z=5,6,7", choices: ["x>y and z>y","x<y and z>y","x>y or z<y","not (z>y)"], answerIndex: 1, categories: ["Branching"] },
  { id: uid(), prompt: "Choose valid one-liner conditional", choices: ["print('A') if cond else print('B')","if cond then print('A') else print('B')","print('A') if cond: else print('B')","'A' ? cond : 'B'"], answerIndex: 0, categories: ["Branching"] },

  // I/O and basics continued
  { id: uid(), prompt: "input('Enter: ') stores into x without casting. x type is", choices: ["str","int","depends","None"], answerIndex: 0, categories: ["IO"] },
  { id: uid(), prompt: "Which line shows prompt + input value echo?", choices: ["print(input('..'))","x=input(); print(x)","both","neither"], answerIndex: 2, categories: ["IO"] },
  { id: uid(), prompt: "Which code formats a message with variables cleanly?", choices: ["print('Age:',age)","print('Age:'+age)","print('Age ' age)","print(age 'Age:')"], answerIndex: 0, categories: ["IO"] },
  { id: uid(), prompt: "Assignment order: x = y*2; y=3 runs to", choices: ["x uses y=3","NameError","x undefined","y doubles"], answerIndex: 1, explanation: "Using y before assigning raises NameError.", categories: ["Variables"] },
  { id: uid(), prompt: "Which are truthy in Python?", choices: ["'' and 0","'a' and 1","[] and 0","'' and 1"], answerIndex: 1, categories: ["Branching"] },

  // Functions deeper
  { id: uid(), prompt: "Function with parameters by position means", choices: ["Order matters","Names only","Unordered","Random"], answerIndex: 0, categories: ["Functions"] },
  { id: uid(), prompt: "help(myfunc) reads", choices: ["Type hints","Docstring","Comments only","Imports"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "Returning vs printing: choose true", choices: ["print returns value","return sends value to caller","return prints to screen","print stops function"], answerIndex: 1, categories: ["Functions"] },
  { id: uid(), prompt: "len returns an", choices: ["int","float","bool","tuple"], answerIndex: 0, categories: ["Functions"] },
];

// Ensure we have 50 by duplicating variants if necessary (without exact duplicates)
// (Here we already have 50 items; but to be safe, we can compute total below.)

// ---------- App ----------
export default function QuizApp() {
  const ALL_CATS: Category[] = ["Variables","IO","Functions","Branching","Errors"];
  const [selected, setSelected] = useState<Category[]>(ALL_CATS);
  const [count, setCount] = useState<number>(50);
  const [started, setStarted] = useState(false);
  const [pool, setPool] = useState<Question[]>([]);
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [showExplain, setShowExplain] = useState(false);

  // validate bank size (>=50)
  const bankByCat = useMemo(() => BANK.filter(q => q.categories.some(c => selected.includes(c))), [selected]);

  const start = () => {
    const n = Math.max(5, Math.min(50, count));
    const chosen = shuffle(bankByCat).slice(0, Math.min(n, bankByCat.length));
    setPool(chosen);
    setAnswers({});
    setIdx(0);
    setStarted(true);
    setShowExplain(false);
  };

  const current = pool[idx];
  const progress = pool.length ? Math.round(((idx) / pool.length) * 100) : 0;

  const selectChoice = (choiceIdx: number) => {
    if (!current) return;
    if (answers[current.id] !== undefined && answers[current.id] !== null) return; // lock after first click
    setAnswers(prev => ({ ...prev, [current.id]: choiceIdx }));
  };

  const isAnswered = (q: Question) => answers[q.id] !== undefined && answers[q.id] !== null;
  const isCorrect = (q: Question) => isAnswered(q) && answers[q.id] === q.answerIndex;

  const next = () => { if (idx < pool.length - 1) { setIdx(i => i + 1); setShowExplain(false); } };
  const prev = () => { if (idx > 0) { setIdx(i => i - 1); setShowExplain(false); } };

  const finished = started && pool.length > 0 && Object.keys(answers).length === pool.length;

  const score = useMemo(() => {
    let correct = 0;
    pool.forEach(q => { if (answers[q.id] === q.answerIndex) correct++; });
    const total = pool.length;
    return { correct, total, pct: total ? Math.round((correct/total)*100) : 0 };
  }, [answers, pool]);

  const incorrectQs = useMemo(() => pool.filter(q => answers[q.id] !== q.answerIndex), [answers, pool]);

  useEffect(() => { setShowExplain(false); }, [idx]);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white text-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl md:text-3xl font-bold">🐍 Python Slides — 50Q Quiz</h1>
          <div className="text-sm text-gray-500">Variables • I/O • Functions • Branching • Errors</div>
        </header>

        {!started && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5 space-y-4">
            <h2 className="text-xl font-semibold">Setup</h2>
            <div>
              <div className="mb-2 text-sm font-medium">Categories</div>
              <div className="flex flex-wrap gap-2">
                {ALL_CATS.map(cat => {
                  const active = selected.includes(cat);
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelected(prev => active ? prev.filter(c => c!==cat) : [...prev, cat])}
                      className={`px-3 py-1 rounded-full border text-sm ${active?"bg-blue-600 text-white border-blue-600":"bg-white border-gray-300 hover:border-gray-400"}`}
                    >{cat}</button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm font-medium">Number of Questions</label>
              <input type="number" min={5} max={50} value={count} onChange={e=>setCount(Math.max(5,Math.min(50, Number(e.target.value)||50)))} className="w-24 rounded border border-gray-300 px-3 py-1" />
              <div className="text-xs text-gray-500">(5–50) Available from selection: {bankByCat.length}</div>
            </div>

            <div className="flex items-center gap-3">
              <button onClick={start} className="rounded-xl bg-blue-600 text-white px-4 py-2 font-medium hover:bg-blue-700">Start Quiz</button>
              <button onClick={()=>{ setSelected(ALL_CATS); setCount(50); }} className="rounded-xl border border-gray-300 px-4 py-2 font-medium hover:border-gray-400">Full Mix (50)</button>
            </div>

            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer select-none">Info</summary>
              <ul className="list-disc pl-6">
                <li>Click an answer once to lock it. Correct turns <b>green</b>, wrong turns <b>red</b> and the correct option is highlighted.</li>
                <li>Progress bar at top of each question. Use Prev/Next to navigate.</li>
                <li>Finish to see score and review missed questions.</li>
              </ul>
            </details>
          </div>
        )}

        {started && current && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            {/* progress */}
            <div className="flex items-center gap-4 mb-4">
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"><div className="h-2 bg-blue-500 transition-all" style={{width: `${Math.max(0, Math.min(100, progress))}%`}} /></div>
              <div className="text-sm text-gray-600 whitespace-nowrap">{idx+1} / {pool.length}</div>
            </div>

            {/* meta */}
            <div className="flex flex-wrap gap-2 mb-2 text-xs">
              {current.categories.map(c => <span key={c} className="inline-flex items-center rounded-full border px-2 py-0.5 border-gray-300 bg-white">{c}</span>)}
            </div>

            <h3 className="text-lg font-semibold mb-2">{current.prompt}</h3>
            {current.code && (
              <pre className="bg-gray-900 text-gray-100 rounded-xl p-3 text-sm overflow-auto mb-3"><code>{current.code}</code></pre>
            )}

            <ul className="space-y-2">
              {current.choices.map((ch, i) => {
                const answered = isAnswered(current);
                const correctIdx = current.answerIndex;
                const selectedIdx = answers[current.id] ?? null;

                const base = "w-full text-left px-4 py-3 rounded-xl border";
                let state = " border-gray-300 hover:border-gray-400";

                if (answered) {
                  if (i === selectedIdx && i === correctIdx) state = " border-green-600 bg-green-50";
                  else if (i === selectedIdx && i !== correctIdx) state = " border-red-600 bg-red-50";
                  else if (i === correctIdx) state = " border-green-600"; // reveal correct
                  else state = " border-gray-300";
                }

                return (
                  <li key={i}>
                    <button
                      onClick={() => selectChoice(i)}
                      disabled={answered}
                      className={`${base}${state}`}
                    >
                      <span className="font-medium mr-2">{String.fromCharCode(97 + i)})</span>
                      {ch}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div className="flex items-center justify-between mt-4">
              <div className="flex gap-2">
                <button onClick={prev} disabled={idx===0} className={`px-4 py-2 rounded-xl border ${idx===0?"border-gray-200 text-gray-400":"border-gray-300 hover:border-gray-400"}`}>Prev</button>
                <button onClick={next} disabled={idx>=pool.length-1} className={`px-4 py-2 rounded-xl border ${idx>=pool.length-1?"border-gray-200 text-gray-400":"border-gray-300 hover:border-gray-400"}`}>Next</button>
              </div>

              <div className="flex items-center gap-2">
                {current.explanation && (
                  <button onClick={()=>setShowExplain(s=>!s)} className="px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400">{showExplain?"Hide":"Show"} Explanation</button>
                )}
                <button onClick={()=>setStarted(false)} className="px-4 py-2 rounded-xl border border-red-300 text-red-700 hover:border-red-400">End</button>
              </div>
            </div>

            {showExplain && current.explanation && (
              <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 text-sm">
                <div className="font-semibold mb-1">Explanation</div>
                <p>{current.explanation}</p>
              </div>
            )}
          </div>
        )}

        {started && finished && (
          <div className="rounded-2xl border border-gray-200 bg-white shadow-sm p-5">
            <h3 className="text-xl font-bold mb-2">Results</h3>
            <div className="flex flex-wrap items-center gap-4 mb-3">
              <div className="text-4xl font-extrabold">{score.pct}%</div>
              <div className="text-gray-600">Score: {score.correct} / {score.total}</div>
            </div>

            <div className="mb-4">
              <div className="text-sm font-medium mb-2">Incorrect Questions</div>
              {incorrectQs.length === 0 ? (
                <div className="text-sm text-green-700">Perfect! 🎉</div>
              ) : (
                <ul className="space-y-2">
                  {incorrectQs.map((q, i) => (
                    <li key={q.id} className="rounded-xl border border-gray-200 p-3">
                      <div className="font-medium">{i+1}. {q.prompt}</div>
                      {q.code && (<pre className="bg-gray-900 text-gray-100 rounded-xl p-3 text-xs overflow-auto mt-2"><code>{q.code}</code></pre>)}
                      <div className="text-sm mt-1">Correct answer: <span className="font-semibold">{q.choices[q.answerIndex]}</span></div>
                      {q.explanation && <div className="text-xs text-gray-600 mt-1">{q.explanation}</div>}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="flex gap-2">
              <button onClick={()=>{ setStarted(false); }} className="px-4 py-2 rounded-xl border border-gray-300 hover:border-gray-400">Back to Setup</button>
              <button onClick={()=>{ setAnswers({}); setIdx(0); }} className="px-4 py-2 rounded-xl bg-blue-600 text-white">Review Again</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
