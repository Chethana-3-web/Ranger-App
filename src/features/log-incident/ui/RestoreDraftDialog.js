/**
 * Log Incident – Restore Draft Dialog (E1)
 *
 * Shown on app launch when an unsaved draft exists.
 * "Restore" navigates to the step after the last completed one.
 * "Discard" deletes the draft.
 */

import React, { useEffect, useState } from 'react';
import { useNavigation } from '@react-navigation/native';

import { getRestoreStep, DraftStep } from '../domain/draft';
import { ConfirmDialog } from '../../../core/ui/ConfirmDialog';
import theme from '../../../core/ui/theme';
import { useDraftRepo } from './hooks/useDraftRepo';

/** Maps DraftStep to the route name in the LogIncident navigator. */
const STEP_ROUTES = {
  [DraftStep.TYPE]:     'IncidentType',
  [DraftStep.PHOTO]:    'AddPhoto',
  [DraftStep.LOCATION]: 'LocationCapture',
  [DraftStep.DETAILS]:  'Details',
};

const RestoreDraftDialog = () => {
  const draftRepo = useDraftRepo();
  const navigation = useNavigation();
  const [draft, setDraft] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    draftRepo.find().then((found) => {
      if (found) {
        setDraft(found);
        setVisible(true);
      }
    });
  }, [draftRepo]);

  const handleRestore = () => {
    setVisible(false);
    const step = getRestoreStep(draft);
    const route = STEP_ROUTES[step] ?? 'IncidentType';
    navigation.navigate('LogIncidentFlow', { screen: route, params: { draft } });
  };

  const handleDiscard = async () => {
    setVisible(false);
    await draftRepo.delete();
    setDraft(null);
  };

  if (!visible || !draft) return null;

  return (
    <ConfirmDialog
      visible={visible}
      title="Unsaved Incident"
      message="You have an unsaved incident. Do you want to restore it?"
      confirmLabel="Restore"
      cancelLabel="Discard"
      confirmColor={theme.colors.primary}
      onConfirm={handleRestore}
      onCancel={handleDiscard}
    />
  );
};

export default RestoreDraftDialog;
