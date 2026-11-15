import { useMemo, useRef, useState } from "react";

type Step = 1 | 2 | 3;
type Template = "1 BHK" | "2 BHK" | "3 BHK" | "Custom";
type Material = { id: string; name: string; unit: string; presets: [number, number, number] };
type Category = { id: string; name: string; description: string; materials: Material[] };

const categories: Category[] = [
  {
    id: "boards",
    name: "Boards & Sheets",
    description: "Plywood, MDF, HDHMR & more",
    materials: [
      ["commercial-plywood", "Commercial Plywood", "sheets", [10, 0, 24]],
      ["bwr-plywood", "BWR Plywood", "sheets", [0, 18, 28]],
      ["marine-plywood", "BWP / Marine Plywood", "sheets", [0, 0, 6]],
      ["mdf", "MDF", "sheets", [4, 0, 8]],
      ["hdhmr", "HDHMR", "sheets", [0, 6, 10]],
      ["particle-board", "Particle Board", "sheets", [0, 0, 0]],
      ["block-board", "Block Board", "sheets", [0, 0, 2]],
      ["wpc-board", "WPC Board", "sheets", [0, 0, 0]],
      ["pvc-foam-board", "PVC Foam Board", "sheets", [0, 0, 0]],
    ].map(([id, name, unit, presets]) => ({ id, name, unit, presets })) as Material[],
  },
  {
    id: "surfaces",
    name: "Laminates & Surface Materials",
    description: "Laminates, acrylic, veneer & more",
    materials: [
      ["laminate-08", "0.8mm Laminate", "sheets", [0, 0, 0]],
      ["laminate-1", "1mm Laminate", "sheets", [14, 24, 36]],
      ["laminate-125", "1.25mm Laminate", "sheets", [0, 0, 0]],
      ["laminate-15", "1.5mm Laminate", "sheets", [0, 0, 0]],
      ["acrylic-sheet", "Acrylic Sheet", "sheets", [0, 0, 4]],
      ["membrane-sheet", "Membrane Sheet", "sheets", [0, 0, 0]],
      ["veneer", "Veneer", "sheets", [0, 0, 0]],
      ["louvers", "Louvers", "panels", [0, 0, 0]],
      ["decorative-panels", "Decorative Panels", "panels", [0, 0, 0]],
    ].map(([id, name, unit, presets]) => ({ id, name, unit, presets })) as Material[],
  },
  {
    id: "finishing",
    name: "Edge Band & Finishing",
    description: "Edge bands, adhesives, polish & more",
    materials: [
      ["edge-08", "PVC Edge Band 0.8mm", "m", [0, 0, 0]],
      ["edge-1", "PVC Edge Band 1mm", "m", [75, 120, 180]],
      ["edge-2", "PVC Edge Band 2mm", "m", [0, 0, 0]],
      ["abs-edge", "ABS Edge Band", "m", [0, 0, 0]],
      ["edge-adhesive", "Edge Band Adhesive", "kg", [5, 10, 15]],
      ["sandpaper", "Sandpaper", "sheets", [0, 0, 0]],
      ["wood-polish", "Wood Polish", "litres", [0, 0, 0]],
      ["paint", "Paint", "litres", [0, 0, 0]],
      ["primer", "Primer", "litres", [0, 0, 0]],
      ["silicone", "Silicone", "tubes", [0, 0, 0]],
    ].map(([id, name, unit, presets]) => ({ id, name, unit, presets })) as Material[],
  },
  {
    id: "hardware",
    name: "Hardware & Fittings",
    description: "Hinges, channels, handles & more",
    materials: [
      ["soft-close-hinges", "Soft Close Hinges", "nos.", [24, 40, 60]],
      ["normal-hinges", "Normal Hinges", "nos.", [0, 0, 0]],
      ["concealed-hinges", "Concealed Hinges", "nos.", [0, 0, 0]],
      ["drawer-channels", "Drawer Channels", "pairs", [4, 6, 10]],
      ["tandem-box", "Tandem Box Channels", "pairs", [0, 0, 0]],
      ["telescopic-channels", "Telescopic Channels", "pairs", [0, 0, 0]],
      ["hydraulic-lift", "Hydraulic Lift", "sets", [0, 0, 0]],
      ["gas-spring", "Gas Spring", "nos.", [0, 0, 0]],
      ["door-magnet", "Door Magnet", "nos.", [0, 0, 0]],
      ["magnetic-catch", "Magnetic Catch", "nos.", [0, 0, 0]],
      ["tower-bolt", "Tower Bolt", "nos.", [0, 0, 0]],
      ["cabinet-lock", "Cabinet Lock", "nos.", [0, 0, 0]],
      ["handle", "Handle", "nos.", [10, 18, 28]],
      ["profile-handle", "Profile Handle", "m", [0, 0, 0]],
      ["gola-profile", "Gola Profile", "m", [0, 0, 0]],
      ["aluminium-profile", "Aluminium Profile", "m", [0, 0, 0]],
    ].map(([id, name, unit, presets]) => ({ id, name, unit, presets })) as Material[],
  },
  {
    id: "fasteners",
    name: "Screws & Fasteners",
    description: "Screws in multiple sizes & fasteners",
    materials: [
      ["screw-1", "1 Inch Screws", "boxes", [0, 0, 0]],
      ["screw-15", "1.5 Inch Screws", "boxes", [1, 2, 3]],
      ["screw-2", "2 Inch Screws", "boxes", [0, 0, 0]],
      ["screw-25", "2.5 Inch Screws", "boxes", [0, 0, 0]],
      ["screw-3", "3 Inch Screws", "boxes", [0, 0, 0]],
      ["confirmat", "Confirmat Screws", "boxes", [0, 0, 0]],
    ].map(([id, name, unit, presets]) => ({ id, name, unit, presets })) as Material[],
  },
];

const allMaterials = categories.flatMap((category) => category.materials);
const presetQuantities = (index: number) =>
  Object.fromEntries(allMaterials.map((material) => [material.id, material.presets[index]]));

function Progress({ step }: { step: Step }) {
  const labels = ["Materials", "Quantities", "List"];
  return (
    <nav className="progress" aria-label="Calculator progress">
      {labels.map((label, index) => {
        const number = (index + 1) as Step;
        const complete = step > number;
        return (
          <div className={`progress-step ${step === number ? "active" : ""}`} key={label}>
            <span className={`step-dot ${step >= number ? "done" : ""}`}>
              {complete ? "✓" : number}
            </span>
            <span>{label}</span>
          </div>
        );
      })}
    </nav>
  );
}

function Header({ step }: { step: Step }) {
  return (
    <>
      <header className="app-header">
        <strong>Materials</strong>
        <span>PROJECT DRAFT</span>
      </header>
      <Progress step={step} />
    </>
  );
}

function Intro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: React.ReactNode;
  description: React.ReactNode;
}) {
  return (
    <section className="intro">
      <p className="eyebrow">{eyebrow}</p>
      <h1>{title}</h1>
      <p className="intro-copy">{description}</p>
    </section>
  );
}

function App() {
  const [step, setStep] = useState<Step>(1);
  const [template, setTemplate] = useState<Template>("2 BHK");
  const [included, setIncluded] = useState(
    () => new Set(categories.map((category) => category.id)),
  );
  const [quantities, setQuantities] = useState<Record<string, number>>(() => presetQuantities(1));
  const [openCategory, setOpenCategory] = useState<string>("boards");
  const [expandedSelection, setExpandedSelection] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [copied, setCopied] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);

  const selectedCategories = categories.filter((category) => included.has(category.id));
  const chosenMaterials = useMemo(
    () =>
      selectedCategories.flatMap((category) =>
        category.materials.filter((material) => (quantities[material.id] || 0) > 0),
      ),
    [included, quantities],
  );

  const goTo = (nextStep: Step) => {
    setStep(nextStep);
    setSearch("");
    setCopied(false);
    window.requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: "smooth" }));
  };

  const applyTemplate = (nextTemplate: Exclude<Template, "Custom">) => {
    const index = nextTemplate === "1 BHK" ? 0 : nextTemplate === "2 BHK" ? 1 : 2;
    setTemplate(nextTemplate);
    setQuantities(presetQuantities(index));
    setIncluded(new Set(categories.map((category) => category.id)));
  };

  const startFromScratch = () => {
    setTemplate("Custom");
    setQuantities(Object.fromEntries(allMaterials.map((material) => [material.id, 0])));
  };

  const toggleCategory = (id: string) => {
    setIncluded((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const changeQuantity = (id: string, amount: number) => {
    setTemplate("Custom");
    setQuantities((current) => ({ ...current, [id]: Math.max(0, (current[id] || 0) + amount) }));
  };

  const formatList = () => {
    const groups = selectedCategories
      .map((category) => ({
        ...category,
        materials: category.materials.filter((material) => (quantities[material.id] || 0) > 0),
      }))
      .filter((category) => category.materials.length > 0);
    return [
      "*INTERIOR WORK — MATERIAL REQUIREMENT LIST*",
      `${template} · ${chosenMaterials.length} materials`,
      "",
      ...groups.flatMap((category) => [
        `*${category.name}*`,
        ...category.materials.map(
          (material) => `• ${material.name}: ${quantities[material.id]} ${material.unit}`,
        ),
        "",
      ]),
      "_Please confirm specifications and final quantities before ordering._",
    ].join("\n");
  };

  const copyList = async () => {
    const text = formatList();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="app-shell" ref={topRef}>
      <div className="app">
        <Header step={step} />

        {step === 1 && (
          <>
            <Intro
              eyebrow="MATERIAL REQUIREMENT CALCULATOR"
              title={
                <>
                  Plan your materials.
                  <br />
                  Not your furniture.
                </>
              }
              description={
                <>
                  A clear starting list for your interior work.
                  <br />
                  Choose a template, then make it yours.
                </>
              }
            />
            <main className="workspace">
              <section className="template-section">
                <h2>Start with a template</h2>
                <p>Sample quantities, not a site-specific estimate.</p>
                <div className="template-grid">
                  {(["1 BHK", "2 BHK", "3 BHK"] as const).map((option) => (
                    <button
                      className={`template-card ${template === option ? "selected" : ""}`}
                      key={option}
                      onClick={() => applyTemplate(option)}
                      type="button"
                    >
                      <span>{template === option ? "●  SELECTED" : "○  TEMPLATE"}</span>
                      <strong>{option}</strong>
                    </button>
                  ))}
                </div>
                <button className="text-button" onClick={startFromScratch} type="button">
                  Or start from scratch →
                </button>
              </section>

              <section className="category-selection">
                <div className="section-heading">
                  <h2>Material categories</h2>
                  <span>{included.size} selected</span>
                </div>
                <p>Keep what you need. Expand to see materials.</p>
                <div className="selection-cards">
                  {categories.map((category) => {
                    const isIncluded = included.has(category.id);
                    const isExpanded = expandedSelection === category.id;
                    return (
                      <article
                        className={`selection-card ${!isIncluded ? "excluded" : ""}`}
                        key={category.id}
                      >
                        <button
                          className="selection-card-heading"
                          onClick={() => toggleCategory(category.id)}
                          type="button"
                          aria-pressed={isIncluded}
                        >
                          <span className="check">{isIncluded ? "✓" : ""}</span>
                          <strong>{category.name}</strong>
                          <span className="chevron">{isExpanded ? "⌃" : "⌄"}</span>
                        </button>
                        <p>{category.description}</p>
                        <button
                          className="materials-link"
                          onClick={() => setExpandedSelection(isExpanded ? null : category.id)}
                          type="button"
                        >
                          {category.materials.length} materials&nbsp; · &nbsp;
                          {isExpanded ? "Hide materials" : "View materials"}
                        </button>
                        {isExpanded && (
                          <div className="material-preview">
                            {category.materials.map((material) => (
                              <span key={material.id}>{material.name}</span>
                            ))}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </section>

              <aside className="note">
                <strong>Built for material planning</strong>
                <p>
                  Boards, surfaces, fittings and fasteners only. Furniture items are never added to
                  your list.
                </p>
              </aside>
            </main>
            <footer className="bottom-action">
              <p>{included.size} categories selected</p>
              <button
                className="primary-button"
                disabled={!included.size}
                onClick={() => goTo(2)}
                type="button"
              >
                Continue to quantities <span>→</span>
              </button>
              <small>Raw materials only. No furniture items.</small>
            </footer>
          </>
        )}

        {step === 2 && (
          <>
            <Intro
              eyebrow="QUANTITY EDITOR"
              title={
                <>
                  Make the quantities
                  <br />
                  your own.
                </>
              }
              description={
                <>
                  Edit the sample quantities below.
                  <br />
                  Only materials above zero join your list.
                </>
              }
            />
            <main className="workspace quantity-workspace">
              <div className="applied-template">
                <div>
                  <strong>{template} template</strong>
                  <span>Sample quantities · fully editable</span>
                </div>
                <button onClick={() => goTo(1)} type="button">
                  Change
                </button>
              </div>
              <input
                className="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search materials…"
                aria-label="Search materials"
              />
              <div className="quantity-guidance">
                <strong>QUANTITY</strong>
                <span>0 = not included</span>
              </div>
              <div className="quantity-categories">
                {selectedCategories.map((category) => {
                  const visibleMaterials = category.materials.filter((material) =>
                    material.name.toLowerCase().includes(search.toLowerCase()),
                  );
                  if (search && !visibleMaterials.length) return null;
                  const isOpen = search.length > 0 || openCategory === category.id;
                  const selectedCount = category.materials.filter(
                    (material) => (quantities[material.id] || 0) > 0,
                  ).length;
                  return (
                    <article className="quantity-card" key={category.id}>
                      <button
                        className="quantity-card-heading"
                        onClick={() => setOpenCategory(isOpen && !search ? "" : category.id)}
                        type="button"
                        aria-expanded={isOpen}
                      >
                        <span>
                          <strong>{category.name}</strong>
                          <small>
                            {selectedCount} selected · {category.materials.length} materials
                          </small>
                        </span>
                        <b>{isOpen ? "⌃" : "⌄"}</b>
                      </button>
                      {isOpen && (
                        <div className="material-rows">
                          {visibleMaterials.map((material) => {
                            const value = quantities[material.id] || 0;
                            return (
                              <div
                                className={`material-row ${value ? "has-quantity" : ""}`}
                                key={material.id}
                              >
                                <div className="material-details">
                                  <strong>{material.name}</strong>
                                  <span>{material.unit}</span>
                                </div>
                                <div
                                  className="quantity-control"
                                  aria-label={`${material.name} quantity`}
                                >
                                  <button
                                    onClick={() => changeQuantity(material.id, -1)}
                                    disabled={value === 0}
                                    aria-label={`Decrease ${material.name}`}
                                    type="button"
                                  >
                                    −
                                  </button>
                                  <output>{value}</output>
                                  <button
                                    onClick={() => changeQuantity(material.id, 1)}
                                    aria-label={`Increase ${material.name}`}
                                    type="button"
                                  >
                                    +
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>
              <aside className="disclaimer">
                <strong>Before you order</strong>
                <p>
                  Review quantities and specifications with your contractor. Site dimensions and
                  wastage are not calculated.
                </p>
              </aside>
            </main>
            <footer className="bottom-action">
              <p>
                {chosenMaterials.length} materials · {selectedCategories.length} categories
              </p>
              <button
                className="primary-button"
                disabled={!chosenMaterials.length}
                onClick={() => goTo(3)}
                type="button"
              >
                Generate material list <span>→</span>
              </button>
              <small>Raw materials only. No furniture items.</small>
            </footer>
          </>
        )}

        {step === 3 && (
          <>
            <Intro
              eyebrow="YOUR MATERIAL LIST"
              title={
                <>
                  One list.
                  <br />
                  Ready to share.
                </>
              }
              description={
                <>
                  Your raw materials, hardware and accessories,
                  <br />
                  consolidated and grouped for easy ordering.
                </>
              }
            />
            <main className="workspace list-workspace">
              <section className="list-overview">
                <div>
                  <strong>{chosenMaterials.length}</strong>
                  <span>materials</span>
                </div>
                <div>
                  <strong>{selectedCategories.length}</strong>
                  <span>categories</span>
                </div>
                <div>
                  <strong>{template}</strong>
                  <span>template</span>
                </div>
              </section>
              <section className="consolidated-list">
                <header>
                  <span>INTERIOR WORK</span>
                  <h2>Material requirement list</h2>
                  <p>{template} · Editable sample quantities</p>
                </header>
                {selectedCategories.map((category) => {
                  const materials = category.materials.filter(
                    (material) => (quantities[material.id] || 0) > 0,
                  );
                  if (!materials.length) return null;
                  return (
                    <div className="list-group" key={category.id}>
                      <h3>{category.name}</h3>
                      {materials.map((material) => (
                        <div className="list-item" key={material.id}>
                          <span>{material.name}</span>
                          <strong>
                            {quantities[material.id]} {material.unit}
                          </strong>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </section>
              <section className="sharing-info">
                <h2>WhatsApp-friendly, by default.</h2>
                <p>
                  Copy all {chosenMaterials.length} materials in one message, with category
                  headings, quantities and units. No zero-quantity items.
                </p>
              </section>
              <aside className="note order-note">
                <strong>Check specifications before ordering.</strong>
                <p>Confirm thicknesses, sizes, brands and final quantities with your contractor.</p>
              </aside>
            </main>
            <footer className="bottom-action">
              <p>
                {chosenMaterials.length} materials · {selectedCategories.length} categories
              </p>
              <button className="primary-button" onClick={copyList} type="button">
                {copied ? "Copied to clipboard" : "Copy entire list"}
              </button>
              <button className="secondary-button" onClick={() => goTo(2)} type="button">
                ← &nbsp; Edit quantities
              </button>
              <small>Plain text, formatted for WhatsApp.</small>
            </footer>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
