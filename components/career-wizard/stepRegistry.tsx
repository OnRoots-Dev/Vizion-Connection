"use client";
// Step component registry — maps WizardStepId → component

import type { ComponentType } from "react";
import type { WizardStepId } from "@/lib/career-wizard/flows";

import { StepBasicIdentity, StepLocationPrefecture, StepSocial } from "./steps/StepCommon";
import {
  StepAthleteSport,
  StepTrainerSpecialty, StepTrainerTarget, StepTrainerCoaching,
  StepTrainerExperience, StepTrainerCertifications,
  StepCrewInterests, StepCrewSports, StepCrewActivity,
  StepCrewCommunities, StepCrewPlaces,
  StepBusinessBasic, StepBusinessCategory, StepBusinessDescription, StepBusinessLocation,
  StepTaglineRole,
} from "./steps/RoleSteps";
import StepProfileMediaWizard from "./steps/StepProfileMediaWizard";
import StepBio from "./steps/StepBio";
import StepStats from "./steps/StepStats";
import StepEpisodes from "./steps/StepEpisodes";
import StepSkills from "./steps/StepSkills";
import StepContact from "./steps/StepContact";
import StepComplete from "./steps/StepComplete";

export const STEP_COMPONENTS: Record<WizardStepId, ComponentType> = {
  basic: StepBasicIdentity,
  media: StepProfileMediaWizard,
  tagline: StepTaglineRole,
  athlete_sport: StepAthleteSport,
  trainer_specialty: StepTrainerSpecialty,
  trainer_target: StepTrainerTarget,
  trainer_coaching: StepTrainerCoaching,
  trainer_experience: StepTrainerExperience,
  trainer_certifications: StepTrainerCertifications,
  crew_interests: StepCrewInterests,
  crew_sports: StepCrewSports,
  crew_activity: StepCrewActivity,
  crew_communities: StepCrewCommunities,
  crew_places: StepCrewPlaces,
  business_basic: StepBusinessBasic,
  business_category: StepBusinessCategory,
  business_description: StepBusinessDescription,
  business_location: StepBusinessLocation,
  location: StepLocationPrefecture,
  bio: StepBio,
  stats: StepStats,
  episodes: StepEpisodes,
  skills: StepSkills,
  social: StepSocial,
  contact: StepContact,
  complete: StepComplete,
};

export function getStepComponent(id: WizardStepId): ComponentType {
  return STEP_COMPONENTS[id] ?? StepComplete;
}
