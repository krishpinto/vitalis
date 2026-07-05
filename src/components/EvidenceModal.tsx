// Evidence-tap modal — the #1 credibility feature. Shows the exact transcript
// quote AND the exact guideline quote a differential was grounded in.

import { Modal, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';
import type { Differential } from '@/types/clinical';

interface Props {
  differential: Differential | null;
  visible: boolean;
  onClose: () => void;
}

function Quote({ label, accent, quote }: { label: string; accent: string; quote: string }) {
  return (
    <View style={styles.quoteBlock}>
      <ThemedText type="smallBold" style={{ color: accent }}>
        {label}
      </ThemedText>
      <View style={[styles.quoteBox, { borderLeftColor: accent }]}>
        <ThemedText style={styles.quoteText}>“{quote}”</ThemedText>
      </View>
    </View>
  );
}

export function EvidenceModal({ differential, visible, onClose }: Props) {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheetWrap} onPress={(e) => e.stopPropagation()}>
          <ThemedView style={styles.sheet}>
            <View style={styles.handle} />
            {differential && (
              <ScrollView contentContainerStyle={styles.content}>
                <ThemedText type="subtitle" style={styles.title}>
                  {differential.diagnosis}
                </ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.reasoning}>
                  {differential.reasoning}
                </ThemedText>

                <Quote
                  label="FROM THE TRANSCRIPT"
                  accent="#047857"
                  quote={differential.transcript_reference}
                />
                <Quote
                  label="FROM THE GUIDELINES"
                  accent="#1D4ED8"
                  quote={differential.guideline_reference}
                />

                <ThemedText type="small" themeColor="textSecondary" style={styles.disclaimer}>
                  Draft for licensed-doctor review. Not a diagnosis.
                </ThemedText>
              </ScrollView>
            )}
            <Pressable style={styles.closeBtn} onPress={onClose}>
              <ThemedText type="smallBold" style={{ color: '#fff' }}>
                Close
              </ThemedText>
            </Pressable>
          </ThemedView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'flex-end' },
  sheetWrap: { width: '100%' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '85%' },
  handle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginBottom: 12 },
  content: { gap: 14, paddingBottom: 8 },
  title: { fontSize: 24 },
  reasoning: { fontSize: 14, lineHeight: 20 },
  quoteBlock: { gap: 6 },
  quoteBox: { borderLeftWidth: 3, paddingLeft: 12, paddingVertical: 4 },
  quoteText: { fontSize: 15, lineHeight: 22, fontStyle: 'italic' },
  disclaimer: { marginTop: 4 },
  closeBtn: { marginTop: 16, backgroundColor: '#111827', paddingVertical: 13, borderRadius: 12, alignItems: 'center' },
});
