import type { ReactNode } from 'react';
import { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Screen =
  | 'route'
  | 'stops'
  | 'details'
  | 'enroute'
  | 'pod'
  | 'completed'
  | 'offline'
  | 'sync'
  | 'settings';

type DriverStop = {
  id: string;
  name: string;
  window: string;
  eta: string;
  orderId?: string;
  status: 'Next' | 'Upcoming' | 'Delivered';
};

const initialStops: DriverStop[] = [
  {
    id: 'OUT077',
    name: 'Kandy Fresh',
    window: '5:00 AM–7:30 AM',
    eta: '7:12 AM',
    orderId: 'WF-1043',
    status: 'Next',
  },
  {
    id: 'OUT079',
    name: 'Kandy',
    window: '4:00 AM–7:45 AM',
    eta: 'Not available',
    status: 'Upcoming',
  },
  {
    id: 'OUT080',
    name: 'Kandy',
    window: '5:30 AM–8:00 AM',
    eta: 'Not available',
    status: 'Upcoming',
  },
];

export default function DriverApp() {
  const [screen, setScreen] = useState<Screen>('route');
  const [stops, setStops] = useState(initialStops);
  const [selectedStop, setSelectedStop] = useState<DriverStop>(initialStops[0]);
  const [recipient, setRecipient] = useState('');
  const [formError, setFormError] = useState('');

  const nextStopId = stops.find((stop) => stop.status !== 'Delivered')?.id;

  function openStop(stop: DriverStop) {
    setSelectedStop(stop);
    setScreen('details');
  }

  function openPod() {
    setRecipient('');
    setFormError('');
    setScreen('pod');
  }

  function confirmDelivery() {
    if (!recipient.trim()) {
      setFormError('Enter the receiver’s name before confirming.');
      return;
    }

    setStops((currentStops) =>
      currentStops.map((stop) =>
        stop.id === selectedStop.id
          ? { ...stop, status: 'Delivered' }
          : stop,
      ),
    );

    setSelectedStop((currentStop) => ({
      ...currentStop,
      status: 'Delivered',
    }));

    setScreen('completed');
  }

  function goToNextStop() {
    const nextStop = stops.find(
      (stop) => stop.id !== selectedStop.id && stop.status !== 'Delivered',
    );

    if (nextStop) {
      setSelectedStop(nextStop);
      setScreen('details');
    } else {
      setScreen('stops');
    }
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.app}>
        <ScrollView contentContainerStyle={styles.content}>
          {screen === 'route' && (
            <>
              <Text style={styles.greeting}>Good Morning, Kasun</Text>
              <Text style={styles.subheading}>Driver</Text>

              <Card>
                <Text style={styles.cardTitle}>Kandy Fresh Route</Text>
                <InfoRow label="Vehicle" value="VEH057" />
                <InfoRow label="Vehicle Type" value="Refrigerated Van" />
                <InfoRow label="Starting Depot" value="Kandy Depot" />
                <InfoRow label="Departure" value="4:45 AM" />
                <InfoRow label="Stops" value={String(stops.length)} />
                <InfoRow
                  label="Delivery Window"
                  value="Before 8:00 AM"
                  blue
                />
              </Card>

              <View style={styles.warning}>
                <Text style={styles.warningTitle}>⚠ Loading Shortfall</Text>
                <Text style={styles.warningText}>
                  Milk · 18 planned → 15 available
                </Text>
                <Text style={styles.warningText}>3 units unavailable</Text>
              </View>

              <PrimaryButton
                title="Start Route"
                onPress={() => setScreen('stops')}
              />
            </>
          )}

          {screen === 'stops' && (
            <>
              <Pressable onPress={() => setScreen('route')}>
                <Text style={styles.backTitle}>← Today’s Stops</Text>
              </Pressable>

              <View style={styles.depot}>
                <Text style={styles.muted}>🚉 Kandy Depot</Text>
              </View>

              {stops.map((stop, index) => {
                const isNext =
                  stop.id === nextStopId && stop.status !== 'Delivered';

                return (
                  <View key={stop.id}>
                    <Text style={styles.downArrow}>↓</Text>
                    <Card>
                      <View style={styles.stopHeading}>
                        <Text style={styles.stopNumber}>{index + 1}</Text>
                        <Text style={styles.stopName}>
                          {stop.id}: {stop.name}
                        </Text>
                        <Text
                          style={
                            stop.status === 'Delivered'
                              ? styles.deliveredTag
                              : isNext
                                ? styles.nextTag
                                : styles.tag
                          }
                        >
                          {stop.status === 'Delivered'
                            ? 'Delivered'
                            : isNext
                              ? '🟢 Next'
                              : 'Upcoming'}
                        </Text>
                      </View>

                      <InfoRow
                        label="Delivery Window"
                        value={stop.window}
                      />

                      <SecondaryButton
                        title="Open Stop"
                        onPress={() => openStop(stop)}
                      />
                    </Card>
                  </View>
                );
              })}
            </>
          )}

          {screen === 'details' && (
            <>
              <Pressable onPress={() => setScreen('stops')}>
                <Text style={styles.backTitle}>
                  ← {selectedStop.id}: {selectedStop.name}
                </Text>
              </Pressable>

              <Text style={styles.subheading}>
                Stop {stops.findIndex((stop) => stop.id === selectedStop.id) + 1}{' '}
                of {stops.length}
              </Text>

              <SecondaryButton
                title="📶 Simulate Connection Loss"
                onPress={() => setScreen('offline')}
                danger
              />

              <Text style={styles.sectionLabel}>DELIVERY INFORMATION</Text>
              <Card>
                <InfoRow
                  label="Order"
                  value={selectedStop.orderId ?? 'Not provided'}
                />
                <InfoRow label="Delivery Window" value={selectedStop.window} />
                <InfoRow label="Vehicle" value="VEH057" />
                <InfoRow label="Status" value={selectedStop.status} />
              </Card>

              {selectedStop.id === 'OUT077' ? (
                <>
                  <Text style={styles.sectionLabel}>ITEMS · FIGMA SAMPLE</Text>
                  <Card>
                    <TableHeader
                      first="PRODUCT"
                      second="PLANNED"
                      third="AVAILABLE"
                    />
                    <TableRow first="Milk" second="18" third="15" alert />
                    <TableRow first="Yogurt" second="10" third="10" success />
                    <TableRow
                      first="Vegetables"
                      second="8"
                      third="8"
                      success
                    />
                    <TableRow
                      first="Frozen Chicken"
                      second="4 kg"
                      third="4"
                      success
                    />
                  </Card>

                  <View style={styles.warning}>
                    <Text style={styles.warningTitle}>
                      ⚠ Loading Shortfall
                    </Text>
                    <Text style={styles.warningText}>
                      Milk: 3 units unavailable
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.infoBanner}>
                  <Text style={styles.muted}>
                    Item-level order details are not included for this demo stop.
                  </Text>
                </View>
              )}

              {selectedStop.status === 'Delivered' ? (
                <View style={styles.successBanner}>
                  <Text style={styles.successText}>
                    This stop is already marked delivered in the demo.
                  </Text>
                </View>
              ) : (
                <PrimaryButton
                  title="Start Route"
                  onPress={() => setScreen('enroute')}
                />
              )}
            </>
          )}

          {screen === 'enroute' && (
            <>
              <Pressable onPress={() => setScreen('details')}>
                <Text style={styles.backTitle}>
                  ← {selectedStop.id}: {selectedStop.name}
                </Text>
              </Pressable>

              <Text style={styles.subheading}>En Route</Text>

              <SecondaryButton
                title="📶 Simulate Connection Loss"
                onPress={() => setScreen('offline')}
                danger
              />

              <Text style={styles.sectionLabel}>TRIP INFORMATION</Text>
              <Card>
                <InfoRow label="ETA" value={selectedStop.eta} blue />
                <InfoRow
                  label="Delivery Window"
                  value={selectedStop.window}
                />
              </Card>

              <Text style={styles.sectionLabel}>ROUTE</Text>
              <View style={styles.routeMap}>
                <Text style={styles.routeMapText}>🚉 Kandy Depot</Text>
                <Text style={styles.routeMapText}>↓</Text>
                <Text style={styles.routeMapText}>🚚 Your vehicle</Text>
                <Text style={styles.routeMapText}>↓</Text>
                <Text style={styles.routeDestination}>
                  📍 {selectedStop.id}: {selectedStop.name}
                </Text>
              </View>

              <PrimaryButton
                title="I’ve Arrived"
                onPress={openPod}
              />
            </>
          )}

          {screen === 'pod' && (
            <>
              <Pressable onPress={() => setScreen('enroute')}>
                <Text style={styles.backTitle}>← Complete Delivery</Text>
              </Pressable>

              <SecondaryButton
                title="📶 Simulate Connection Loss"
                onPress={() => setScreen('offline')}
                danger
              />

              <Card>
                <InfoRow
                  label="Store"
                  value={`${selectedStop.id}: ${selectedStop.name}`}
                />
                <InfoRow
                  label="Order"
                  value={selectedStop.orderId ?? 'Not provided'}
                />
              </Card>

              {selectedStop.id === 'OUT077' ? (
                <>
                  <Text style={styles.sectionLabel}>
                    DELIVERY QUANTITY · FIGMA SAMPLE
                  </Text>
                  <Card>
                    <TableHeader
                      first="PRODUCT"
                      second="EXPECTED"
                      third="DELIVERED"
                    />
                    <TableRow first="Milk" second="18" third="15 ⚠" alert />
                    <TableRow first="Yogurt" second="10" third="10" success />
                    <TableRow
                      first="Vegetables"
                      second="8"
                      third="8"
                      success
                    />
                    <TableRow
                      first="Chilled Chicken"
                      second="4"
                      third="4"
                      success
                    />
                  </Card>

                  <View style={styles.warning}>
                    <Text style={styles.warningTitle}>
                      ⚠ 3 units of Milk short
                    </Text>
                  </View>
                </>
              ) : (
                <View style={styles.infoBanner}>
                  <Text style={styles.muted}>
                    Enter the confirmed item quantities when they are available.
                  </Text>
                </View>
              )}

              <Text style={styles.sectionLabel}>RECEIVER INFORMATION</Text>
              <Card>
                <InfoRow label="Receiver" value="Store Manager" />

                <Text style={styles.inputLabel}>Receiver name</Text>
                <TextInput
                  style={styles.input}
                  value={recipient}
                  onChangeText={(value) => {
                    setRecipient(value);
                    setFormError('');
                  }}
                  placeholder="Confirm receiver name"
                />

                <Text style={styles.inputLabel}>
                  Signature / Proof of Delivery
                </Text>
                <View style={styles.signatureBox}>
                  <Text style={styles.muted}>
                    Signature area · visual placeholder
                  </Text>
                </View>
              </Card>

              {!!formError && (
                <Text style={styles.errorText}>{formError}</Text>
              )}

              <PrimaryButton
                title="Confirm Delivery"
                onPress={confirmDelivery}
              />
            </>
          )}

          {screen === 'completed' && (
            <>
              <Text style={styles.greeting}>Delivery Completed</Text>

              <View style={styles.completedHero}>
                <Text style={styles.checkmark}>✅</Text>
                <Text style={styles.cardTitle}>Delivery Completed</Text>
                <Text style={styles.muted}>
                  {selectedStop.id}: {selectedStop.name}
                  {selectedStop.orderId
                    ? ` · Order ${selectedStop.orderId}`
                    : ''}
                </Text>
              </View>

              <Card>
                <Text style={styles.successText}>
                  ✓ Delivery marked complete in this demo
                </Text>
                <Text style={styles.muted}>
                  This does not save to the backend or capture a signature.
                </Text>
              </Card>

              <PrimaryButton title="Next Stop" onPress={goToNextStop} />
            </>
          )}

          {screen === 'offline' && (
            <>
              <Pressable onPress={() => setScreen('pod')}>
                <Text style={styles.backTitle}>
                  ← {selectedStop.id}: {selectedStop.name}
                </Text>
              </Pressable>

              <SecondaryButton
                title="🔄 Simulate Reconnect"
                onPress={() => setScreen('sync')}
                success
              />

              <View style={styles.offlineBanner}>
                <Text style={styles.offlineTitle}>
                  🔴 No Internet Connection
                </Text>
              </View>

              <Card>
                <InfoRow label="Last Synced" value="6:42 AM" />
                <InfoRow label="Pending Changes" value="1" />
              </Card>

              <Text style={styles.sectionLabel}>DRIVER CAN STILL</Text>
              <Card>
                {[
                  'View today’s route',
                  'View stops',
                  'View order details',
                  'Record delivery',
                  'Capture POD',
                  'Continue delivery',
                ].map((item) => (
                  <Text key={item} style={styles.checklist}>
                    ✓ {item}
                  </Text>
                ))}
              </Card>

              <Text style={styles.offlineNote}>
                Offline mode is simulated in this prototype. It does not save
                delivery records.
              </Text>

              <PrimaryButton
                title="Continue Delivery"
                onPress={() => setScreen('pod')}
              />
            </>
          )}

          {screen === 'sync' && (
            <>
              <Text style={styles.greeting}>Sync Status</Text>

              <View style={styles.successBanner}>
                <Text style={styles.successText}>🟢 Connection Restored</Text>
                <Text style={styles.muted}>Sync screen prototype</Text>
              </View>

              <Text style={styles.sectionLabel}>SYNC PROGRESS</Text>
              <Card>
                <Text style={styles.checklist}>✓ Delivery recorded</Text>
                <Text style={styles.checklist}>✓ POD saved</Text>
                <Text style={styles.checklist}>
                  ✓ Delivery status updated
                </Text>
                <Text style={styles.checklist}>
                  ✓ Route progress updated
                </Text>
              </Card>

              <View style={styles.syncBanner}>
                <Text style={styles.syncText}>☑ Demo sync complete</Text>
              </View>

              <PrimaryButton
                title="Continue Route"
                onPress={() => setScreen('route')}
              />
            </>
          )}

          {screen === 'settings' && (
            <>
              <Text style={styles.greeting}>Settings</Text>
              <Text style={styles.subheading}>Kasun · Driver</Text>

              <Card>
                <Text style={styles.cardTitle}>K  Kasun</Text>
                <Text style={styles.muted}>
                  Vehicle VEH057 · Refrigerated Van
                </Text>
              </Card>

              <Text style={styles.sectionLabel}>OPTIONS</Text>
              <Card>
                {[
                  'Trip History',
                  'App Settings',
                  'Help & Support',
                  'Notifications',
                  'Log Out',
                ].map((item) => (
                  <Pressable key={item} style={styles.optionRow}>
                    <Text style={styles.optionText}>{item}</Text>
                    <Text style={styles.muted}>›</Text>
                  </Pressable>
                ))}
              </Card>
            </>
          )}
        </ScrollView>

        <View style={styles.tabBar}>
          <TabButton
            label="Route"
            active={screen === 'route'}
            onPress={() => setScreen('route')}
          />
          <TabButton
            label="Stops"
            active={screen === 'stops'}
            onPress={() => setScreen('stops')}
          />
          <TabButton
            label="Settings"
            active={screen === 'settings'}
            onPress={() => setScreen('settings')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function InfoRow({
  label,
  value,
  blue = false,
}: {
  label: string;
  value: string;
  blue?: boolean;
}) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.muted}>{label}</Text>
      <Text style={[styles.infoValue, blue && styles.blueText]}>{value}</Text>
    </View>
  );
}

function TableHeader({
  first,
  second,
  third,
}: {
  first: string;
  second: string;
  third: string;
}) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.tableHeading, styles.productColumn]}>{first}</Text>
      <Text style={styles.tableHeading}>{second}</Text>
      <Text style={styles.tableHeading}>{third}</Text>
    </View>
  );
}

function TableRow({
  first,
  second,
  third,
  alert = false,
  success = false,
}: {
  first: string;
  second: string;
  third: string;
  alert?: boolean;
  success?: boolean;
}) {
  return (
    <View style={styles.tableRow}>
      <Text style={[styles.productColumn, styles.productText]}>{first}</Text>
      <Text style={styles.tableValue}>{second}</Text>
      <Text
        style={[
          styles.tableValue,
          alert && styles.alertText,
          success && styles.successText,
        ]}
      >
        {third}
      </Text>
    </View>
  );
}

function PrimaryButton({
  title,
  onPress,
}: {
  title: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.primaryButton} onPress={onPress}>
      <Text style={styles.primaryButtonText}>{title}</Text>
    </Pressable>
  );
}

function SecondaryButton({
  title,
  onPress,
  danger = false,
  success = false,
}: {
  title: string;
  onPress: () => void;
  danger?: boolean;
  success?: boolean;
}) {
  return (
    <Pressable
      style={[
        styles.secondaryButton,
        danger && styles.dangerButton,
        success && styles.reconnectButton,
      ]}
      onPress={onPress}
    >
      <Text
        style={
          danger
            ? styles.dangerText
            : success
              ? styles.successText
              : styles.blueText
        }
      >
        {title}
      </Text>
    </Pressable>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.tabButton} onPress={onPress}>
      <Text style={active ? styles.activeTab : styles.inactiveTab}>
        {active ? '●' : '○'}
      </Text>
      <Text style={active ? styles.activeTabLabel : styles.tabLabel}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F4F6FA' },
  app: { flex: 1 },
  content: { padding: 18, paddingBottom: 110 },
  greeting: { color: '#172033', fontSize: 24, fontWeight: '700', marginTop: 8 },
  subheading: { color: '#68738A', fontSize: 13, marginTop: 4, marginBottom: 14 },
  backTitle: { color: '#172033', fontSize: 20, fontWeight: '700', marginBottom: 6 },
  card: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E0E6EF',
    borderWidth: 1,
    borderRadius: 15,
    padding: 15,
    marginTop: 12,
  },
  cardTitle: { color: '#172033', fontSize: 15, fontWeight: '700', marginBottom: 8 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, marginTop: 11 },
  infoValue: { color: '#172033', fontSize: 13, fontWeight: '600', textAlign: 'right', flexShrink: 1 },
  muted: { color: '#68738A', fontSize: 13 },
  blueText: { color: '#2453D4', fontWeight: '700' },
  warning: { backgroundColor: '#FFF1C7', borderColor: '#F2CF66', borderWidth: 1, borderRadius: 14, padding: 14, marginTop: 14 },
  warningTitle: { color: '#A84D00', fontWeight: '700', marginBottom: 6 },
  warningText: { color: '#915000', fontSize: 13, marginTop: 4 },
  primaryButton: { backgroundColor: '#1949D2', borderRadius: 13, padding: 16, alignItems: 'center', marginTop: 18 },
  primaryButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700' },
  secondaryButton: { backgroundColor: '#FFFFFF', borderColor: '#DCE3EE', borderWidth: 1, borderRadius: 11, padding: 12, alignItems: 'center', marginTop: 12 },
  dangerButton: { backgroundColor: '#FFE7E5', borderColor: '#FFD0CB' },
  dangerText: { color: '#BE2929', fontSize: 12, fontWeight: '700' },
  reconnectButton: { backgroundColor: '#E2F6E8', borderColor: '#BDE7C8' },
  depot: { backgroundColor: '#FFFFFF', padding: 10, alignItems: 'center', marginTop: 14 },
  downArrow: { color: '#9AA6B7', textAlign: 'center', fontSize: 20, marginVertical: 4 },
  stopHeading: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  stopNumber: { color: '#FFFFFF', backgroundColor: '#1949D2', overflow: 'hidden', borderRadius: 20, paddingHorizontal: 8, paddingVertical: 4, fontWeight: '700' },
  stopName: { flex: 1, color: '#172033', fontSize: 13, fontWeight: '700' },
  nextTag: { color: '#16814B', backgroundColor: '#E3F7EC', overflow: 'hidden', borderRadius: 10, padding: 5, fontSize: 11 },
  tag: { color: '#68738A', backgroundColor: '#F0F2F6', overflow: 'hidden', borderRadius: 10, padding: 5, fontSize: 11 },
  deliveredTag: { color: '#16814B', backgroundColor: '#E3F7EC', overflow: 'hidden', borderRadius: 10, padding: 5, fontSize: 11 },
  sectionLabel: { color: '#96A2B4', fontSize: 10, fontWeight: '700', letterSpacing: 0.8, marginTop: 20, marginBottom: 2 },
  tableRow: { flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#E8EBF1', paddingVertical: 12 },
  tableHeading: { flex: 1, color: '#8491A6', fontSize: 9, fontWeight: '700', textAlign: 'center' },
  productColumn: { flex: 1.5, textAlign: 'left' },
  productText: { color: '#172033', fontSize: 12, fontWeight: '600' },
  tableValue: { flex: 1, color: '#68738A', fontSize: 12, textAlign: 'center' },
  alertText: { color: '#B85400', fontWeight: '700' },
  successText: { color: '#16814B', fontWeight: '700', marginVertical: 5 },
  routeMap: { backgroundColor: '#171D2D', borderRadius: 14, padding: 18, marginTop: 12, gap: 12 },
  routeMapText: { color: '#FFFFFF', fontSize: 13 },
  routeDestination: { color: '#77B9FF', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#DCE3EE', borderRadius: 10, padding: 12, marginTop: 10, color: '#172033' },
  inputLabel: { color: '#68738A', fontSize: 12, marginTop: 16 },
  signatureBox: { height: 75, borderWidth: 1, borderStyle: 'dashed', borderColor: '#DCE3EE', borderRadius: 10, marginTop: 8, justifyContent: 'center', alignItems: 'center' },
  errorText: { color: '#B51F1F', fontSize: 12, marginTop: 10 },
  helper: { color: '#68738A', fontSize: 12, textAlign: 'center', marginTop: 8 },
  infoBanner: { backgroundColor: '#EDF0F4', padding: 14, borderRadius: 12, marginTop: 14 },
  successBanner: { backgroundColor: '#DFF5E6', borderColor: '#B5E5C3', borderWidth: 1, borderRadius: 14, padding: 15, marginTop: 15 },
  completedHero: { backgroundColor: '#FFFFFF', alignItems: 'center', padding: 24, marginTop: 30 },
  checkmark: { fontSize: 42, marginBottom: 12 },
  offlineBanner: { backgroundColor: '#FFE7E5', borderColor: '#FFC5C1', borderWidth: 1, borderRadius: 14, padding: 16, marginTop: 14 },
  offlineTitle: { color: '#B51F1F', fontSize: 16, fontWeight: '700' },
  checklist: { color: '#172033', fontSize: 13, marginVertical: 6 },
  offlineNote: { color: '#68738A', backgroundColor: '#EDF0F4', padding: 14, borderRadius: 12, marginTop: 14, fontSize: 12 },
  syncBanner: { backgroundColor: '#E8EEFF', borderColor: '#CCD8FF', borderWidth: 1, borderRadius: 12, padding: 14, marginTop: 14 },
  syncText: { color: '#2453D4', fontWeight: '700' },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#EEF0F4' },
  optionText: { color: '#172033', fontSize: 14 },
  tabBar: { position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E6ED', flexDirection: 'row', justifyContent: 'space-around', paddingTop: 10, paddingBottom: 8 },
  tabButton: { alignItems: 'center', minWidth: 70, gap: 4 },
  activeTab: { color: '#1949D2', fontSize: 15 },
  inactiveTab: { color: '#96A2B4', fontSize: 15 },
  activeTabLabel: { color: '#1949D2', fontSize: 10, fontWeight: '700' },
  tabLabel: { color: '#96A2B4', fontSize: 10 },
});