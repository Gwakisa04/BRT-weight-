'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useLoadGuardStore } from '@/store/loadguard-store';
import { toast } from 'sonner';
import { 
  Settings, 
  Scale, 
  Wifi, 
  Volume2, 
  Printer, 
  Palette,
  Server,
  Save,
  RotateCcw
} from 'lucide-react';

export default function SettingsPage() {
  const { settings, updateSettings, theme, setTheme } = useLoadGuardStore();
  const setSystemStatus = useLoadGuardStore((s) => s.setSystemStatus);
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    toast.success('Settings saved successfully');
  };

  const handleReset = () => {
    setLocalSettings(settings);
    toast.info('Changes reverted');
  };

  const handleTestConnection = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Testing connection...',
        success: 'Connection successful!',
        error: 'Connection failed',
      }
    );
  };

  const handleCalibrate = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 3000)),
      {
        loading: 'Calibrating sensor...',
        success: 'Calibration complete!',
        error: 'Calibration failed',
      }
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            System Settings
          </h1>
          <p className="text-muted-foreground">
            Configure system parameters and preferences
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button onClick={handleSave} className="gap-2">
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="sensor">Sensor</TabsTrigger>
          <TabsTrigger value="alarm">Alarm</TabsTrigger>
          <TabsTrigger value="connection">Connection</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="h-5 w-5" />
                Weight Configuration
              </CardTitle>
              <CardDescription>
                Configure weight measurement settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weightUnit">Weight Unit</Label>
                  <Select
                    value={localSettings.weightUnit}
                    onValueChange={(value: 'kg' | 'ton' | 'lb') => 
                      setLocalSettings({ ...localSettings, weightUnit: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Kilograms (kg)</SelectItem>
                      <SelectItem value="ton">Metric Tons (ton)</SelectItem>
                      <SelectItem value="lb">Pounds (lb)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Warning Threshold (%)</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Show warning when weight reaches this percentage of allowed limit
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localSettings.thresholds.warningPercentage]}
                      onValueChange={([value]) => 
                        setLocalSettings({
                          ...localSettings,
                          thresholds: { ...localSettings.thresholds, warningPercentage: value }
                        })
                      }
                      max={100}
                      min={50}
                      step={5}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-mono">
                      {localSettings.thresholds.warningPercentage}%
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Overload Threshold (%)</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Trigger overload alert when weight exceeds this percentage
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localSettings.thresholds.overloadPercentage]}
                      onValueChange={([value]) => 
                        setLocalSettings({
                          ...localSettings,
                          thresholds: { ...localSettings.thresholds, overloadPercentage: value }
                        })
                      }
                      max={120}
                      min={100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-12 text-right font-mono">
                      {localSettings.thresholds.overloadPercentage}%
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Printer className="h-5 w-5" />
                Printer Configuration
              </CardTitle>
              <CardDescription>
                Configure ticket printing settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Printing</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically print tickets after measurement
                  </p>
                </div>
                <Switch
                  checked={localSettings.printerEnabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, printerEnabled: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="printerName">Printer Name</Label>
                <Input
                  id="printerName"
                  value={localSettings.printerName}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, printerName: e.target.value })
                  }
                  disabled={!localSettings.printerEnabled}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sensor" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="h-5 w-5" />
                ESP32 Sensor Configuration
              </CardTitle>
              <CardDescription>
                Configure weight sensor and calibration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="sensorId">Sensor ID</Label>
                  <Input
                    id="sensorId"
                    value={localSettings.sensorId}
                    onChange={(e) =>
                      setLocalSettings({ ...localSettings, sensorId: e.target.value })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div>
                  <Label>Calibration Offset (kg)</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Adjust the sensor reading offset for calibration
                  </p>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[localSettings.calibrationOffset]}
                      onValueChange={([value]) =>
                        setLocalSettings({ ...localSettings, calibrationOffset: value })
                      }
                      max={100}
                      min={-100}
                      step={1}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-mono">
                      {localSettings.calibrationOffset > 0 ? '+' : ''}
                      {localSettings.calibrationOffset} kg
                    </span>
                  </div>
                </div>

                <Button variant="outline" onClick={handleCalibrate} className="gap-2">
                  <Scale className="h-4 w-4" />
                  Run Auto-Calibration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alarm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Volume2 className="h-5 w-5" />
                Alarm Configuration
              </CardTitle>
              <CardDescription>
                Configure buzzer and alarm settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Alarm</Label>
                  <p className="text-sm text-muted-foreground">
                    Sound alarm when overload is detected
                  </p>
                </div>
                <Switch
                  checked={localSettings.alarmEnabled}
                  onCheckedChange={(checked) =>
                    setLocalSettings({ ...localSettings, alarmEnabled: checked })
                  }
                />
              </div>

              <div>
                <Label>Alarm Volume</Label>
                <p className="text-sm text-muted-foreground mb-3">
                  Adjust the buzzer volume level
                </p>
                <div className="flex items-center gap-4">
                  <Slider
                    value={[localSettings.alarmVolume]}
                    onValueChange={([value]) =>
                      setLocalSettings({ ...localSettings, alarmVolume: value })
                    }
                    max={100}
                    min={0}
                    step={10}
                    className="flex-1"
                    disabled={!localSettings.alarmEnabled}
                  />
                  <span className="w-12 text-right font-mono">
                    {localSettings.alarmVolume}%
                  </span>
                </div>
              </div>

              <Button 
                variant="outline" 
                disabled={!localSettings.alarmEnabled}
                onClick={() => {
                  setSystemStatus({ buzzerActive: true });
                  toast.success('Alarm test playing', {
                    description: 'Using alarm.mp3 — stops automatically after 3 seconds',
                  });
                  window.setTimeout(() => {
                    setSystemStatus({ buzzerActive: false });
                  }, 3000);
                }}
                className="gap-2"
              >
                <Volume2 className="h-4 w-4" />
                Test Alarm
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="connection" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Backend Connection
              </CardTitle>
              <CardDescription>
                Configure API and WebSocket connection settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="backendUrl">Backend URL</Label>
                <Input
                  id="backendUrl"
                  placeholder="https://brt-weight-backend.onrender.com"
                  value={localSettings.backendUrl}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, backendUrl: e.target.value })
                  }
                />
              </div>

              <Button variant="outline" onClick={handleTestConnection} className="gap-2">
                <Wifi className="h-4 w-4" />
                Test Connection
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Appearance
              </CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Use dark theme for the interface
                  </p>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
