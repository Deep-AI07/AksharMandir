import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../services/api';
import { 
  Sparkles, 
  Upload, 
  CheckCircle2, 
  Ruler, 
  TreePine, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  Phone,
  FileText,
  Hammer,
  Home,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';

export const CustomMandirPage: React.FC = () => {
  const { user, submitCustomRequest, formatPrice, showToast } = useApp();
  const navigate = useNavigate();

  // Form State
  const [fullName, setFullName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  // Dimensions
  const [width, setWidth] = useState('36');
  const [depth, setDepth] = useState('20');
  const [height, setHeight] = useState('48');
  const [unit, setUnit] = useState<'Inches' | 'Feet'>('Inches');

  // Material & Polish
  const [material, setMaterial] = useState('Sheesham Wood');
  const [finish, setFinish] = useState('Natural Teak Polish');
  const [mounting, setMounting] = useState('Floor Rested');

  // Feature Options
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'Solid Brass Bells (8x)',
    'Dual Velvet Drawers',
    'Slide-out Prasad & Aarti Tray'
  ]);
  const [engraving, setEngraving] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Uploaded Image
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedRequest, setSubmittedRequest] = useState<any | null>(null);

  const availableFeatures = [
    'Backlit Warm Om LED Panel',
    'Solid Brass Bells (8x)',
    'Dual Velvet Drawers',
    'Slide-out Prasad & Aarti Tray',
    'Foldable Acoustic Jaali Doors',
    'Gold Leaf Gopuram Kalash Spire',
    'Multi-tier Deity Idol Step Pedestal'
  ];

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter(f => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  // Real-time Estimated Quote Calculation
  const calculateEstimatedQuote = () => {
    const w = parseFloat(width) || 36;
    const d = parseFloat(depth) || 20;
    const h = parseFloat(height) || 48;

    // Base volume index
    const volumeFactor = unit === 'Feet' ? (w * d * h) * 1728 : (w * d * h);
    let baseRate = volumeFactor * 1.15;

    if (material === 'Teak Wood') baseRate *= 1.25;
    if (material === 'Rosewood') baseRate *= 1.4;
    if (material === 'Brass Inlay Teak') baseRate *= 1.35;

    // Feature add-ons
    const featuresCost = selectedFeatures.length * 2500;

    return Math.max(25000, Math.round((baseRate + featuresCost) / 500) * 500);
  };

  const estimatedTotal = calculateEstimatedQuote();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      showToast('Please fill in your contact information.', 'error');
      return;
    }

    if (fullName.trim().length < 2) {
      showToast('Full name must be at least 2 characters.', 'error');
      return;
    }

    if (!email.includes('@') || !email.includes('.')) {
      showToast('Please enter a valid email address.', 'error');
      return;
    }

    const cleanPhone = phone.trim().replace(/[\s\-()]/g, '');
    if (cleanPhone.length < 10) {
      showToast('Please enter a valid 10-digit contact phone number.', 'error');
      return;
    }

    if (pincode.trim() && pincode.trim().length < 6) {
      showToast('Please enter a valid 6-digit postal pincode.', 'error');
      return;
    }

    if (Number(width) <= 0 || Number(height) <= 0) {
      showToast('Mandir width and height must be positive numbers.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      let uploadedImageUrl: string | null = null;
      if (imageFile) {
        setUploadingImage(true);
        uploadedImageUrl = await api.upload.uploadImage(imageFile);
        setUploadingImage(false);
      }

      const requestPayload = {
        fullName: fullName.trim(),
        phone: phone.trim(),
        email: email.toLowerCase().trim(),
        city: city.trim(),
        pincode: pincode.trim(),
        width: String(width),
        depth: String(depth),
        height: String(height),
        unit,
        materialPreference: material,
        finishType: finish,
        mounting,
        features: selectedFeatures,
        engravingRequirements: engraving.trim() || null,
        additionalRequirements: additionalNotes.trim() || null,
        referenceImageUrl: uploadedImageUrl,
        estimatedQuote: estimatedTotal,
      };

      const result = await submitCustomRequest(requestPayload);
      setSubmittedRequest(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      showToast(err.message || 'Failed to submit custom mandir request.', 'error');
    } finally {
      setIsSubmitting(false);
      setUploadingImage(false);
    }
  };

  if (submittedRequest) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase tracking-widest font-bold text-[#570000]">Consultation Confirmed</span>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1f1c1b]">
            Custom Mandir Request Received
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 max-w-lg mx-auto">
            Reference ID: <strong className="font-mono text-[#570000]">{submittedRequest.requestNumber || submittedRequest.id}</strong>
          </p>
        </div>

        {/* Summary Card */}
        <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] text-left space-y-4 shadow-sm text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#eae5e2]">
            <span className="text-gray-500 font-medium">Estimated Master Quote:</span>
            <span className="font-serif font-bold text-lg text-[#570000]">{formatPrice(submittedRequest.estimatedQuote)}</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Mandir Dimensions</span>
              <strong>{submittedRequest.width}"W x {submittedRequest.depth}"D x {submittedRequest.height}"H ({submittedRequest.unit})</strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Timber / Material</span>
              <strong>{submittedRequest.materialPreference}</strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Finish & Polish</span>
              <strong>{submittedRequest.finishType}</strong>
            </div>
            <div>
              <span className="text-gray-400 block uppercase font-bold text-[10px]">Mounting Type</span>
              <strong>{submittedRequest.mounting}</strong>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <button
            onClick={() => navigate('/mandirs')}
            className="px-6 py-3 rounded-xl bg-[#570000] text-white text-xs font-bold shadow-md hover:bg-[#800000] transition-colors"
          >
            Explore Ready Mandirs
          </button>
          <button
            onClick={() => setSubmittedRequest(null)}
            className="px-6 py-3 rounded-xl border border-[#eae5e2] text-gray-700 text-xs font-semibold hover:bg-gray-50 transition-colors"
          >
            Submit Another Request
          </button>
          <Link
            to="/"
            className="px-6 py-3 rounded-xl border border-[#eae5e2] bg-white text-gray-700 hover:text-[#570000] hover:border-[#570000] text-xs font-semibold shadow-2xs transition-colors flex items-center gap-1.5"
          >
            <Home className="w-4 h-4" />
            <span>Return to Home</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div id="custom-mandir-page" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#eae5e2]">
        <nav className="flex items-center gap-2 text-xs text-gray-500 overflow-x-auto whitespace-nowrap">
          <Link to="/" className="hover:text-[#570000] flex items-center gap-1">
            <Home className="w-3.5 h-3.5 text-gray-400" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <Link to="/mandirs" className="hover:text-[#570000]">Mandirs</Link>
          <ChevronRight className="w-3 h-3 text-gray-400 shrink-0" />
          <span className="text-[#570000] font-bold">Bespoke Mandir Configurator</span>
        </nav>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <Link
            to="/mandirs"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Mandirs</span>
          </Link>
          <Link
            to="/"
            className="px-3 py-1.5 rounded-xl border border-[#eae5e2] bg-white hover:border-[#570000] text-gray-700 hover:text-[#570000] text-xs font-semibold flex items-center gap-1 transition-colors shadow-2xs"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
        </div>
      </div>

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#fdcc87]/20 border border-[#fdcc87]/40 text-[#570000] text-xs font-semibold tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-[#d4af37]" />
          <span>Bespoke Pooja Ghar Mandir</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-[#1f1c1b]">
          Configure Your Custom Mandir
        </h1>
        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
          Specify exact dimensions for your home mandir, choose from seasoned North Indian Sheesham or Burma Teak, and select traditional jaali motifs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: Parameters */}
        <div className="lg:col-span-8 space-y-6">
          {/* Step 1: Dimensions */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
              <Ruler className="w-4 h-4 text-[#570000]" />
              <span>1. Mandir Dimensions</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Width</label>
                <input
                  type="number"
                  required
                  min="12"
                  max="120"
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Depth</label>
                <input
                  type="number"
                  required
                  min="8"
                  max="60"
                  value={depth}
                  onChange={(e) => setDepth(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Height</label>
                <input
                  type="number"
                  required
                  min="16"
                  max="144"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden focus:border-[#570000]"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Unit</label>
                <select
                  value={unit}
                  onChange={(e: any) => setUnit(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                >
                  <option value="Inches">Inches (in)</option>
                  <option value="Feet">Feet (ft)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Timber & Polish */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
              <TreePine className="w-4 h-4 text-[#570000]" />
              <span>2. Timber, Polish & Mounting</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Timber Type</label>
                <select
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                >
                  <option value="Sheesham Wood">Seasoned Sheesham Wood</option>
                  <option value="Teak Wood">Burma Teak Wood</option>
                  <option value="Rosewood">Pure Indian Rosewood</option>
                  <option value="Brass Inlay Teak">Brass Inlay Teak</option>
                  <option value="Composite Marble">Composite White Stone</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Finish / Polish</label>
                <select
                  value={finish}
                  onChange={(e) => setFinish(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                >
                  <option value="Natural Teak Polish">Natural Teak Polish</option>
                  <option value="Dark Walnut">Dark Walnut Polish</option>
                  <option value="Antique Honey">Antique Honey Finish</option>
                  <option value="Heritage Rosewood">Heritage Rosewood</option>
                  <option value="Matte Ivory & Gold">Matte Ivory & Gold</option>
                </select>
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Mounting</label>
                <select
                  value={mounting}
                  onChange={(e) => setMounting(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                >
                  <option value="Floor Rested">Floor Rested Standing</option>
                  <option value="Wall Mounted">Wall Mounted Floating</option>
                  <option value="Convertible (Floor/Wall)">Convertible Style</option>
                </select>
              </div>
            </div>
          </div>

          {/* Step 3: Mandir Features */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#570000]" />
              <span>3. Mandir Features & Pooja Inlays</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableFeatures.map((feat) => {
                const selected = selectedFeatures.includes(feat);
                return (
                  <div
                    key={feat}
                    onClick={() => toggleFeature(feat)}
                    className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selected
                        ? 'border-[#570000] bg-[#570000]/5 text-[#570000]'
                        : 'border-[#eae5e2] hover:border-gray-300 text-gray-700'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-md flex items-center justify-center border ${
                      selected ? 'bg-[#570000] border-[#570000] text-white' : 'border-gray-300'
                    }`}>
                      {selected && <CheckCircle2 className="w-3 h-3" />}
                    </div>
                    <span className="text-xs font-semibold">{feat}</span>
                  </div>
                );
              })}
            </div>

            {/* Custom Sanskrit Engraving */}
            <div className="pt-2">
              <label className="text-xs uppercase font-bold text-gray-500 block mb-1">
                Custom Sanskrit Shloka / Mantra Engraving (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Gayatri Mantra, Maha Mrityunjaya, Om Namah Shivaya..."
                value={engraving}
                onChange={(e) => setEngraving(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs focus:outline-hidden focus:border-[#570000]"
              />
            </div>
          </div>

          {/* Step 4: Reference Image & Contact Details */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-[#eae5e2] shadow-xs space-y-4">
            <h3 className="font-serif font-bold text-base text-[#1f1c1b] flex items-center gap-2">
              <Upload className="w-4 h-4 text-[#570000]" />
              <span>4. Reference Photo & Contact Details</span>
            </h3>

            {/* Image Uploader */}
            <div className="border-2 border-dashed border-[#eae5e2] rounded-2xl p-6 text-center space-y-2 hover:border-[#570000] transition-colors">
              <input
                type="file"
                id="ref-image"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
              <label htmlFor="ref-image" className="cursor-pointer block space-y-2">
                {imagePreview ? (
                  <div className="max-w-xs mx-auto space-y-2">
                    <img src={imagePreview} alt="Reference Preview" className="h-32 object-cover rounded-xl mx-auto" />
                    <span className="text-xs text-[#570000] font-semibold underline block">Click to change reference photo</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-8 h-8 text-gray-400 mx-auto" />
                    <p className="text-xs font-semibold text-gray-700">Upload pooja room sketch or reference photo</p>
                    <p className="text-[11px] text-gray-400">PNG, JPG up to 10MB</p>
                  </>
                )}
              </label>
            </div>

            {/* Contact inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs uppercase font-bold text-gray-500 block mb-1">City & Pincode</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="City"
                    className="w-2/3 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                  <input
                    type="text"
                    required
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value)}
                    placeholder="Pincode"
                    className="w-1/3 px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs font-semibold focus:outline-hidden"
                  />
                </div>
              </div>
            </div>

            {/* Additional requirements */}
            <div>
              <label className="text-xs uppercase font-bold text-gray-500 block mb-1">Additional Requirements / Idol Clearance Notes</label>
              <textarea
                rows={2}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="e.g. Need 18-inch inner mandir clearance for Radha Krishna marble murti..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#fbf9f8] border border-[#eae5e2] text-xs focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Right Summary: Real-Time Estimate & Submit */}
        <div className="lg:col-span-4 space-y-6 sticky top-28">
          <div className="p-6 rounded-3xl bg-white border border-[#eae5e2] shadow-xl space-y-6">
            <div className="border-b border-[#eae5e2] pb-4 space-y-1">
              <span className="text-[10px] uppercase tracking-widest font-bold text-[#7b581e]">Artisan Estimate</span>
              <h3 className="font-serif font-bold text-xl text-[#1f1c1b]">Custom Quotation</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Mandir Size:</span>
                <strong className="text-[#1f1c1b]">{width}" x {depth}" x {height}" ({unit})</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Timber Grade:</span>
                <strong className="text-[#1f1c1b]">{material}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Polish Finish:</span>
                <strong className="text-[#1f1c1b]">{finish}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Mounting Style:</span>
                <strong className="text-[#1f1c1b]">{mounting}</strong>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Active Features:</span>
                <strong className="text-[#1f1c1b]">{selectedFeatures.length} Selected</strong>
              </div>
            </div>

            {/* Total Display */}
            <div className="p-4 rounded-2xl bg-[#570000]/5 border border-[#570000]/15 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-500">Estimated Total Quote</span>
              <div className="text-3xl font-serif font-bold text-[#570000]">
                {formatPrice(estimatedTotal)}
              </div>
              <p className="text-[10px] text-gray-500">Advance: {formatPrice(Math.round(estimatedTotal * 0.3))} (30% on CAD approval)</p>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 rounded-xl bg-[#570000] text-white hover:bg-[#800000] text-xs font-bold shadow-lg shadow-[#570000]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Submitting Consultation...</span>
              ) : (
                <>
                  <span>Submit Custom Mandir Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="pt-2 text-center text-[11px] text-gray-400 space-y-1">
              <p>✓ 100% Free Consultation & CAD Draft</p>
              <p>✓ Zero Obligation Quote</p>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
