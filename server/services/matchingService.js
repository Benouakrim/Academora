import { getAllUniversities } from '../data/universities.js';
import pool from '../database/pool.js';

async function resolvePlanKey(user) {
  if (!user) {
    return 'anonymous';
  }

  // Default to free if user has no plan reference
  if (!user.plan_id) {
    return 'free';
  }

  try {
    const result = await pool.query('SELECT key FROM plans WHERE id = $1', [user.plan_id]);
    return result.rows[0]?.key || 'free';
  } catch (err) {
    console.error('Unexpected error while resolving plan key:', err);
    return 'free';
  }
}

const isNumber = (value) => typeof value === 'number' && !Number.isNaN(value);

const normalizeString = (value) =>
  value === undefined || value === null ? null : String(value).trim().toLowerCase();

const pickValue = (source, keys) => {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null) return value;
  }
  return undefined;
};

const arrayFromValue = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return [value];
};

function buildCriteriaChecks(criteria = {}) {
  const checks = [];

  const addCheck = (fn) => {
    if (typeof fn === 'function') {
      checks.push(fn);
    }
  };

  const country = normalizeString(criteria.country);
  if (country && country !== 'any') {
    addCheck((uni) => {
      const uniCountry = pickValue(uni, ['country', 'location_country']);
      if (!uniCountry) return null;
      return normalizeString(uniCountry) === country;
    });
  }

  const maxTuition = criteria.maxTuition ?? criteria.maxBudget;
  if (isNumber(maxTuition)) {
    addCheck((uni) => {
      const tuition = pickValue(uni, ['avg_tuition_per_year', 'tuition_international', 'tuition']);
      if (!isNumber(tuition)) return null;
      return Number(tuition) <= maxTuition;
    });
  }

  const minTuition = criteria.minTuition;
  if (isNumber(minTuition)) {
    addCheck((uni) => {
      const tuition = pickValue(uni, ['avg_tuition_per_year', 'tuition_international', 'tuition']);
      if (!isNumber(tuition)) return null;
      return Number(tuition) >= minTuition;
    });
  }

  const interests = Array.isArray(criteria.interests) ? criteria.interests : [];
  if (interests.length > 0) {
    const target = interests.map((item) => normalizeString(item)).filter(Boolean);
    if (target.length > 0) {
      addCheck((uni) => {
        const uniInterests = arrayFromValue(pickValue(uni, ['interests', 'focus_areas'])).map((item) => normalizeString(item)).filter(Boolean);
        if (uniInterests.length === 0) return null;
        return target.every((interest) => uniInterests.includes(interest));
      });
    }
  }

  const academics = criteria.academics;
  if (academics?.enabled) {
    const filters = academics.filters || {};

    if (isNumber(filters.minGpa)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['min_gpa', 'gpa_requirement']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minGpa;
      });
    }

    if (filters.degreeLevel && filters.degreeLevel !== 'Any') {
      const target = normalizeString(filters.degreeLevel);
      addCheck((uni) => {
        const levels = arrayFromValue(pickValue(uni, ['degree_levels', 'degree_options'])).map((item) => normalizeString(item)).filter(Boolean);
        if (levels.length === 0) return null;
        return levels.includes(target);
      });
    }

    if (Array.isArray(filters.languages) && filters.languages.length > 0) {
      const target = filters.languages.map((item) => normalizeString(item)).filter(Boolean);
      if (target.length > 0) {
        addCheck((uni) => {
          const languages = arrayFromValue(pickValue(uni, ['languages', 'instruction_languages'])).map((item) => normalizeString(item)).filter(Boolean);
          if (languages.length === 0) return null;
          return target.every((lang) => languages.includes(lang));
        });
      }
    }

    if (filters.testPolicy && filters.testPolicy !== 'Any') {
      const desired = normalizeString(filters.testPolicy);
      addCheck((uni) => {
        const tests = arrayFromValue(pickValue(uni, ['required_tests', 'testing_policy'])).map((item) => normalizeString(item)).filter(Boolean);
        if (tests.length === 0) return null;
        if (desired === 'no-test') {
          return tests.length === 0;
        }
        if (desired === 'requires-test') {
          return tests.length > 0;
        }
        return tests.includes(desired);
      });
    }
  }

  const financials = criteria.financials;
  if (financials?.enabled) {
    const filters = financials.filters || {};

    if (isNumber(filters.maxBudget)) {
      addCheck((uni) => {
        const tuition = pickValue(uni, ['avg_tuition_per_year', 'tuition_international', 'tuition']);
        if (!isNumber(tuition)) return null;
        return Number(tuition) <= filters.maxBudget;
      });
    }

    if (isNumber(filters.maxCostOfLiving)) {
      addCheck((uni) => {
        const cost = pickValue(uni, ['cost_of_living_index', 'cost_of_living']);
        if (!isNumber(cost)) return null;
        return Number(cost) <= filters.maxCostOfLiving;
      });
    }

    if (isNumber(filters.minScholarship)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['scholarship_availability', 'scholarships_available']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minScholarship;
      });
    }

    if (filters.scholarshipsInternational === true) {
      addCheck((uni) => {
        const value = pickValue(uni, ['scholarships_international', 'international_scholarships_available']);
        if (value === undefined) return null;
        return Boolean(value) === true;
      });
    }

    if (filters.needBlind === true) {
      addCheck((uni) => {
        const value = pickValue(uni, ['need_blind_admissions', 'need_blind']);
        if (value === undefined) return null;
        return Boolean(value) === true;
      });
    }
  }

  const lifestyle = criteria.lifestyle;
  if (lifestyle?.enabled) {
    const filters = lifestyle.filters || {};

    if (filters.country && filters.country !== 'Any') {
      const target = normalizeString(filters.country);
      addCheck((uni) => {
        const value = pickValue(uni, ['country', 'location_country']);
        if (!value) return null;
        return normalizeString(value) === target;
      });
    }

    if (filters.city) {
      const target = normalizeString(filters.city);
      addCheck((uni) => {
        const value = pickValue(uni, ['location_city', 'city']);
        if (!value) return null;
        return normalizeString(value) === target;
      });
    }

    if (filters.climate && filters.climate !== 'Any') {
      const target = normalizeString(filters.climate);
      addCheck((uni) => {
        const value = pickValue(uni, ['climate']);
        if (!value) return null;
        return normalizeString(value) === target;
      });
    }

    if (filters.campusSetting && filters.campusSetting !== 'Any') {
      const target = normalizeString(filters.campusSetting);
      addCheck((uni) => {
        const value = pickValue(uni, ['campus_setting']);
        if (!value) return null;
        return normalizeString(value) === target;
      });
    }
  }

  const admissions = criteria.admissions;
  if (admissions?.enabled) {
    const filters = admissions.filters || {};

    if (isNumber(filters.maxAcceptanceRate)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['acceptance_rate']);
        if (!isNumber(value)) return null;
        return Number(value) <= filters.maxAcceptanceRate;
      });
    }

    if (isNumber(filters.minSat)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['sat_average', 'sat_minimum']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minSat;
      });
    }
  }

  const demographics = criteria.demographics;
  if (demographics?.enabled) {
    const filters = demographics.filters || {};

    if (isNumber(filters.minEnrollment)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['enrollment', 'student_population']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minEnrollment;
      });
    }

    if (isNumber(filters.maxEnrollment)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['enrollment', 'student_population']);
        if (!isNumber(value)) return null;
        return Number(value) <= filters.maxEnrollment;
      });
    }

    if (isNumber(filters.minInternationalPct)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['international_student_percentage', 'intl_student_percentage']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minInternationalPct;
      });
    }

    if (isNumber(filters.maxInternationalPct)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['international_student_percentage', 'intl_student_percentage']);
        if (!isNumber(value)) return null;
        return Number(value) <= filters.maxInternationalPct;
      });
    }
  }

  const future = criteria.future;
  if (future?.enabled) {
    const filters = future.filters || {};

    if (isNumber(filters.minVisaMonths)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['post_grad_visa_strength', 'post_study_work_visa_months']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minVisaMonths;
      });
    }

    if (isNumber(filters.minInternshipStrength)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['internship_strength']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minInternshipStrength;
      });
    }

    if (isNumber(filters.minAlumniStrength)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['alumni_network_strength']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minAlumniStrength;
      });
    }

    if (isNumber(filters.minGraduationRate)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['graduation_rate']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minGraduationRate;
      });
    }

    if (isNumber(filters.minEmploymentRate)) {
      addCheck((uni) => {
        const value = pickValue(uni, ['employment_rate', 'graduate_employment_rate']);
        if (!isNumber(value)) return null;
        return Number(value) >= filters.minEmploymentRate;
      });
    }
  }

  return checks;
}

export async function getMatchingUniversities(criteria = {}, user = null) {
  const universities = await getAllUniversities();
  const minPercentage = isNumber(criteria.minMatchPercentage) ? Number(criteria.minMatchPercentage) : 0;
  const criteriaChecks = buildCriteriaChecks(criteria);

  const evaluated = universities.map((uni) => {
    if (criteriaChecks.length === 0) {
      return { ...uni, matchPercentage: 100 };
    }

    let total = 0;
    let matched = 0;

    for (const check of criteriaChecks) {
      const outcome = check(uni);
      if (outcome === null) continue;
      total += 1;
      if (outcome) matched += 1;
    }

    const percentage = total === 0 ? 100 : (matched / total) * 100;

    return {
      ...uni,
      matchPercentage: Math.round(percentage),
    };
  });

  const filtered = evaluated.filter((uni) => uni.matchPercentage >= minPercentage);

  filtered.sort((a, b) => {
    if (b.matchPercentage !== a.matchPercentage) {
      return b.matchPercentage - a.matchPercentage;
    }
    const aTuition = isNumber(a.avg_tuition_per_year) ? a.avg_tuition_per_year : Infinity;
    const bTuition = isNumber(b.avg_tuition_per_year) ? b.avg_tuition_per_year : Infinity;
    return aTuition - bTuition;
  });

  const totalCount = filtered.length;
  const planKey = await resolvePlanKey(user);

  if (planKey === 'anonymous') {
    return {
      matches: filtered.slice(0, 3),
      totalCount,
    };
  }

  return {
    matches: filtered,
    totalCount,
  };
}

