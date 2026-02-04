import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, Check, Loader2, Send, Users, FileText, PoundSterling, Clock, Home, Calendar } from 'lucide-react';

type Segment = 'BUSY_PRO' | 'PROP_MGR' | 'SMALL_BIZ' | 'DIY_DEFERRER' | 'BUDGET' | 'OLDER_WOMAN';

const SEGMENT_OPTIONS: { value: Segment; label: string; description: string }[] = [
  { value: 'BUSY_PRO', label: 'Busy Professional', description: 'Time-poor, values speed & convenience' },
  { value: 'OLDER_WOMAN', label: 'Older Customer', description: 'Values trust, safety & reliability' },
  { value: 'PROP_MGR', label: 'Property Manager', description: 'Manages multiple properties, needs fast response' },
  { value: 'SMALL_BIZ', label: 'Small Business', description: 'Needs after-hours, minimal disruption' },
  { value: 'DIY_DEFERRER', label: 'DIY Deferrer', description: 'Has a list of jobs, price-conscious' },
  { value: 'BUDGET', label: 'Budget Customer', description: 'Most price-sensitive, single tier only' },
];

export default function GenerateQuoteLinkSimple() {
  const { toast } = useToast();

  // State
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState('');
  const [copied, setCopied] = useState(false);

  // Customer fields
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');

  // Job fields
  const [jobDescription, setJobDescription] = useState('');
  const [segment, setSegment] = useState<Segment>('BUSY_PRO');

  // Pricing - manual base rate
  const [basePrice, setBasePrice] = useState('');

  // Value signals
  const [urgencyReason, setUrgencyReason] = useState<'low' | 'med' | 'high'>('med');
  const [ownershipContext, setOwnershipContext] = useState<'tenant' | 'homeowner' | 'landlord' | 'airbnb' | 'selling'>('homeowner');
  const [desiredTimeframe, setDesiredTimeframe] = useState<'flex' | 'week' | 'asap'>('week');

  // Generated pricing display
  const [generatedPricing, setGeneratedPricing] = useState<{
    essential: number;
    enhanced: number;
    elite: number;
  } | null>(null);

  // Generate quote
  const handleGenerate = async () => {
    if (!customerName.trim()) {
      toast({ title: 'Missing Name', description: 'Please enter customer name.', variant: 'destructive' });
      return;
    }
    if (!phone.trim()) {
      toast({ title: 'Missing Phone', description: 'Please enter phone number.', variant: 'destructive' });
      return;
    }
    if (!jobDescription.trim()) {
      toast({ title: 'Missing Job', description: 'Please describe the job.', variant: 'destructive' });
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      toast({ title: 'Missing Price', description: 'Please enter the base price.', variant: 'destructive' });
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/quotes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          phone,
          email: email || undefined,
          postcode: postcode || undefined,
          address: address || undefined,
          jobDescription,
          segment,
          basePrice: parseFloat(basePrice),
          urgencyReason,
          ownershipContext,
          desiredTimeframe,
          quoteMode: 'hhh',
        }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to create quote' }));
        throw new Error(error.message || error.error);
      }

      const data = await response.json();
      const url = `${window.location.origin}/quote/${data.shortSlug}`;
      setGeneratedUrl(url);

      // Set pricing from response (prices are in pence)
      setGeneratedPricing({
        essential: data.essentialPrice / 100,
        enhanced: data.enhancedPrice / 100,
        elite: data.elitePrice / 100,
      });

      toast({ title: 'Quote Created!', description: 'Link is ready to share.' });

    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    toast({ title: 'Copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const message = `Hi ${customerName.split(' ')[0]}, here's your quote from Rooketrade Electrical: ${generatedUrl}`;
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('44') ? cleanPhone : cleanPhone.startsWith('0') ? '44' + cleanPhone.slice(1) : '44' + cleanPhone;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleReset = () => {
    setCustomerName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setPostcode('');
    setJobDescription('');
    setSegment('BUSY_PRO');
    setBasePrice('');
    setUrgencyReason('med');
    setOwnershipContext('homeowner');
    setDesiredTimeframe('week');
    setGeneratedUrl('');
    setGeneratedPricing(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center mb-8">
        <img
          src="/rooketrade-logo.png"
          alt="Rooketrade Electrical"
          className="w-16 h-16 mx-auto mb-4 object-contain"
        />
        <h1 className="text-3xl font-bold text-foreground">Generate Quote</h1>
        <p className="text-muted-foreground mt-2">Create a value-priced quote with tier options</p>
      </div>

      {/* Customer Info */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Users className="w-5 h-5 text-blue-600" />
            Customer Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Name *</Label>
              <Input value={customerName} onChange={(e) => setCustomerName(e.target.value)} placeholder="John Smith" />
            </div>
            <div className="space-y-2">
              <Label>Phone *</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07700 900000" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@example.com" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Address</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="123 Main Street" />
            </div>
            <div className="space-y-2">
              <Label>Postcode</Label>
              <Input value={postcode} onChange={(e) => setPostcode(e.target.value)} placeholder="NG1 1AA" />
            </div>
          </div>

          {/* Customer Segment */}
          <div className="space-y-2">
            <Label>Customer Segment</Label>
            <Select value={segment} onValueChange={(v: Segment) => setSegment(v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SEGMENT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <span className="font-medium">{opt.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">- {opt.description}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Job Details */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5 text-green-600" />
            Job Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>What needs doing? *</Label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the electrical work needed..."
              className="w-full min-h-[120px] px-3 py-2 border border-input rounded-md bg-background resize-none text-foreground"
            />
          </div>
        </CardContent>
      </Card>

      {/* Value Signals & Pricing */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <PoundSterling className="w-5 h-5 text-rooketrade-blue" />
            Pricing & Value Signals
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Base Price */}
          <div className="space-y-2">
            <Label>Base Price (£) *</Label>
            <Input
              type="number"
              value={basePrice}
              onChange={(e) => setBasePrice(e.target.value)}
              placeholder="150"
              min="0"
            />
            <p className="text-xs text-muted-foreground">
              This is your base rate. Tier prices will be calculated automatically.
            </p>
          </div>

          {/* Value Signals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Urgency
              </Label>
              <Select value={urgencyReason} onValueChange={(v: 'low' | 'med' | 'high') => setUrgencyReason(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low (flexible)</SelectItem>
                  <SelectItem value="med">Medium (within a week)</SelectItem>
                  <SelectItem value="high">High (urgent)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Home className="w-4 h-4" />
                Property
              </Label>
              <Select value={ownershipContext} onValueChange={(v: any) => setOwnershipContext(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="homeowner">Homeowner</SelectItem>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                  <SelectItem value="airbnb">Airbnb/Holiday Let</SelectItem>
                  <SelectItem value="selling">Selling Property</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Timeframe
              </Label>
              <Select value={desiredTimeframe} onValueChange={(v: 'flex' | 'week' | 'asap') => setDesiredTimeframe(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="flex">Flexible</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="asap">ASAP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generate Button */}
      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        className="w-full h-14 text-lg font-semibold bg-rooketrade-blue hover:bg-rooketrade-blue text-slate-900"
      >
        {isGenerating ? (
          <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Generating...</>
        ) : (
          <><Send className="w-5 h-5 mr-2" /> Generate Quote Link</>
        )}
      </Button>

      {/* Generated Result */}
      {generatedUrl && generatedPricing && (
        <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/20">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-700 dark:text-green-400">Quote Ready!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Pricing Display */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-background rounded-lg p-3 text-center border">
                <div className="text-xs text-muted-foreground uppercase">Standard</div>
                <div className="text-xl font-bold text-foreground">£{Math.round(generatedPricing.essential)}</div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center border-2 border-green-500">
                <div className="text-xs text-green-600 uppercase font-semibold">Priority</div>
                <div className="text-xl font-bold text-green-700">£{Math.round(generatedPricing.enhanced)}</div>
              </div>
              <div className="bg-background rounded-lg p-3 text-center border">
                <div className="text-xs text-muted-foreground uppercase">Premium</div>
                <div className="text-xl font-bold text-foreground">£{Math.round(generatedPricing.elite)}</div>
              </div>
            </div>

            {/* URL */}
            <div className="flex items-center gap-2 bg-background rounded-lg p-3 border">
              <input type="text" value={generatedUrl} readOnly className="flex-1 bg-transparent text-sm font-mono truncate text-foreground" />
              <Button variant="outline" size="sm" onClick={handleCopy}>
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={handleWhatsApp} className="flex-1 bg-green-600 hover:bg-green-700">
                Send via WhatsApp
              </Button>
              <Button variant="outline" onClick={() => window.open(generatedUrl, '_blank')} className="flex-1">
                Preview Quote
              </Button>
            </div>

            <Button variant="ghost" onClick={handleReset} className="w-full mt-2">
              Create Another Quote
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
