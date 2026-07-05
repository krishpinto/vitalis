// Review — the transcript (chat styling continues), photo/records attachments,
// entity chips after structuring, then the differential draft CTA.

import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { ArrowRight, Camera, FileText, Sparkles, X } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { EntityCard } from '@/components/EntityCard';
import { TranscriptView } from '@/components/TranscriptView';
import { Chip, EmptyState, ErrorCard, PrimaryButton, Rise, SectionHeader, SkeletonCard, T } from '@/components/ui';
import { reasonDifferentials, structureTranscript } from '@/lib/gemini';
import { useConsult } from '@/lib/store';
import { color, radius, space } from '@/theme';
import type { Attachment } from '@/types/clinical';

export default function ReviewScreen() {
  const router = useRouter();
  const { transcript, chunks, entities, setEntities, setDiagnosis, attachments, addAttachment, removeAttachment } =
    useConsult();

  const [structuring, setStructuring] = useState(false);
  const [reasoning, setReasoning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!transcript) {
    return (
      <View style={styles.emptyScreen}>
        <EmptyState
          icon={FileText}
          text="No transcript yet — record a consult first."
          actionLabel="Back to patients"
          onAction={() => router.replace('/patients')}
        />
      </View>
    );
  }

  async function attachPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      quality: 0.7,
      base64: true,
    });
    const asset = result.assets?.[0];
    if (result.canceled || !asset?.base64) return;
    addAttachment({
      id: `att_${Date.now()}`,
      uri: asset.uri,
      mimeType: asset.mimeType ?? 'image/jpeg',
      base64: asset.base64,
    } satisfies Attachment);
  }

  async function analyze() {
    setError(null);
    setStructuring(true);
    try {
      setEntities(await structureTranscript(transcript!));
    } catch (err) {
      setError(`Structuring failed: ${err}`);
    } finally {
      setStructuring(false);
    }
  }

  async function generateDifferential() {
    if (!entities) return;
    setError(null);
    setReasoning(true);
    try {
      setDiagnosis(await reasonDifferentials(entities, transcript, attachments));
      router.push('/diagnosis');
    } catch (err) {
      setError(`Reasoning failed: ${err}`);
    } finally {
      setReasoning(false);
    }
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <SectionHeader
          title="Transcript"
          trailing={
            transcript.isDemo ? <Chip label="synthetic" tint={color.ribbonText} soft={color.ribbonBg} /> : undefined
          }
        />
        <TranscriptView lines={transcript.lines} chunks={chunks} />

        <SectionHeader
          title="Photos & records"
          trailing={
            <Pressable onPress={attachPhoto} hitSlop={8} accessibilityRole="button" style={styles.attachBtn}>
              <Camera size={15} color={color.accent} strokeWidth={2.2} />
              <T variant="caption" tone="accent" style={{ fontWeight: '600' }}>
                Attach
              </T>
            </Pressable>
          }
        />
        {attachments.length === 0 ? (
          <T variant="caption" tone="faint">
            Optional — attach a rash photo or prior report to inform the draft.
          </T>
        ) : (
          <View style={styles.thumbs}>
            {attachments.map((a) => (
              <View key={a.id} style={styles.thumbWrap}>
                <Image source={{ uri: a.uri }} style={styles.thumb} />
                <Pressable
                  onPress={() => removeAttachment(a.id)}
                  style={styles.thumbRemove}
                  hitSlop={8}
                  accessibilityRole="button">
                  <X size={12} color={color.onAccent} strokeWidth={2.5} />
                </Pressable>
              </View>
            ))}
          </View>
        )}

        {(structuring || entities) && <SectionHeader title="Structured summary" />}
        {structuring ? (
          <SkeletonCard lines={5} />
        ) : (
          entities && (
            <Rise>
              <EntityCard entities={entities} />
            </Rise>
          )
        )}

        {error && <ErrorCard message={error} onRetry={entities ? generateDifferential : analyze} />}
      </ScrollView>

      <View style={styles.footer}>
        {!entities ? (
          <PrimaryButton label="Analyze" onPress={analyze} loading={structuring} icon={Sparkles} />
        ) : (
          <PrimaryButton
            label="Generate differential draft"
            onPress={generateDifferential}
            loading={reasoning}
            icon={ArrowRight}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: color.bg },
  emptyScreen: { flex: 1, backgroundColor: color.bg, justifyContent: 'center' },
  scroll: { padding: space.l, gap: space.m, paddingBottom: space.xl },
  attachBtn: { flexDirection: 'row', alignItems: 'center', gap: space.xs },
  thumbs: { flexDirection: 'row', flexWrap: 'wrap', gap: space.m },
  thumbWrap: { position: 'relative' },
  thumb: { width: 72, height: 72, borderRadius: radius.button, backgroundColor: color.border },
  thumbRemove: {
    position: 'absolute',
    top: -space.xs,
    right: -space.xs,
    width: 20,
    height: 20,
    borderRadius: radius.chip,
    backgroundColor: color.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    padding: space.l,
    backgroundColor: color.card,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: color.border,
  },
});
