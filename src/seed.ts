import type {Catalog, EnumOption, ParamAtom, ParamGroup, ParamValueType, ProductCategory, QuoteConfig} from './types';

let seq = 1;

function options(pairs: string[]): EnumOption[] {
  return pairs.map((item) => {
    const [value, label] = item.includes('|') ? item.split('|') : [item, item];
    return {value, label};
  });
}

function param(
  key: string,
  title: string,
  group: ParamGroup,
  extra: Partial<ParamAtom> & {valueType?: ParamValueType} = {},
): ParamAtom {
  return {
    id: `p${seq++}`,
    key,
    backendKey: extra.backendKey || key,
    title,
    group,
    valueType: extra.valueType || 'string',
    options: extra.options || [],
    suffix: extra.suffix || '',
    pattern: extra.pattern || '',
    defaultValue: extra.defaultValue || '',
    custom: false,
  };
}

const currency = options(['USD', 'HKD', 'AUD', 'CAD', 'JPY', 'EUR', 'NZD', 'SGD', 'CHF', 'GBP', 'CNH']);
const months = options(['1', '2', '3', '6', '12']);
const yesNo = options(['Yes', 'No']);

export function createSeed(): Catalog {
  seq = 1;
  const params: ParamAtom[] = [
    param('currency', 'Currency', 'underlying', {options: currency, defaultValue: 'USD'}),
    param('underlying', 'Underlying', 'underlying', {valueType: 'array', defaultValue: ''}),
    param('direction', 'Direction', 'underlying', {options: options(['TwinWin', 'Bullish', 'Bearish'])}),
    param('optionType', 'Option Type', 'underlying', {valueType: 'number', options: options(['0|Call', '1|Put']), defaultValue: '0'}),
    param('format', 'Format', 'underlying', {options: options(['Note', 'Warrant']), defaultValue: 'Note'}),

    param('tenor', 'Tenor', 'tenor', {suffix: 'm', pattern: 'int', defaultValue: '6'}),
    param('guaranteedPeriods', 'Guaranteed Period', 'tenor', {suffix: 'm', options: options(['0', '1', '2', '3', '6', '12', '2w', '4w', '1m', '2m']), defaultValue: '0'}),
    param('observationFrequency', 'Observation Frequency', 'tenor', {suffix: 'm', options: months, defaultValue: '1'}),
    param('effectiveDateOffset', 'Effective Date Offset', 'tenor', {options: options(['10', '5']), defaultValue: '10'}),
    param('couponPaymentFrequency', 'Coupon Frequency', 'tenor', {suffix: 'm', options: options(['1', '3', '6', '12', '1000|At Maturity']), defaultValue: '3'}),
    param('callableFrequency', 'Callable Frequency', 'tenor', {suffix: 'm', options: options(['1', '3', '6', '12']), defaultValue: '3'}),
    param('settlementFrequency', 'Settlement Frequency', 'tenor', {options: options(['Biweekly', 'Monthly']), defaultValue: 'Biweekly'}),
    param('nonCallPeriod', 'Non-call Period', 'tenor', {suffix: 'm', pattern: 'int'}),
    param('guaranteedDays', 'Guaranteed Days', 'tenor', {pattern: 'int', defaultValue: '20'}),
    param('investmentDays', 'Investment Days', 'tenor', {pattern: 'int', defaultValue: '30'}),
    param('totalDays', 'Total Days', 'tenor', {pattern: 'int', defaultValue: '235'}),
    param('issueDate', 'Issue Date', 'tenor', {valueType: 'date', pattern: 'date'}),
    param('finalValuationDate', 'Final Valuation Date', 'tenor', {valueType: 'date', pattern: 'date'}),
    param('maturityDate', 'Maturity Date', 'tenor', {valueType: 'date', pattern: 'date'}),

    param('koType', 'KO Type', 'barrier', {options: options(['Period End', 'Period End Memory', 'Daily', 'Daily Memory']), defaultValue: 'Period End'}),
    param('ko', 'KO Barrier', 'barrier', {backendKey: 'koBarrier', suffix: '%', pattern: 'float2', defaultValue: '100'}),
    param('koStepdown', 'KO Stepdown', 'barrier', {backendKey: 'monthlyKoStepDown', suffix: '%', pattern: 'float2', defaultValue: '2'}),
    param('koSettlementCycle', 'KO Settlement Cycle', 'barrier', {options: options(['Yes']), defaultValue: 'Yes'}),
    param('kiType', 'KI Type', 'barrier', {backendKey: 'barrierType', options: options(['NONE', 'AKI', 'EKI']), defaultValue: 'NONE'}),
    param('ki', 'KI Barrier', 'barrier', {backendKey: 'kiBarrier', suffix: '%', pattern: 'float2'}),
    param('couponKoType', 'Coupon KO Type', 'barrier', {backendKey: 'exercise', valueType: 'number', options: options(['0|European', '1|American']), defaultValue: '0'}),
    param('couponBarrier', 'Coupon Barrier', 'barrier', {suffix: '%', pattern: 'float2', defaultValue: '80'}),
    param('upperBarrier', 'Upper Barrier', 'barrier', {suffix: '%', pattern: 'float2'}),
    param('lowerBarrier', 'Lower Barrier', 'barrier', {suffix: '%', pattern: 'float2'}),

    param('couponPA', 'Coupon p.a.', 'coupon', {backendKey: 'coupon', suffix: '%', pattern: 'float2', defaultValue: '12'}),
    param('conditionalCouponPA', 'Conditional Coupon p.a.', 'coupon', {backendKey: 'coupon', suffix: '%', pattern: 'float2'}),
    param('couponType', 'Coupon Type', 'coupon', {valueType: 'number', options: options(['1|Memory', '2|Non-Memory']), defaultValue: '1'}),
    param('bonus', 'Bonus', 'coupon', {suffix: '%', pattern: 'float2'}),
    param('cashRebate', 'Cash Rebate', 'coupon', {suffix: '%', pattern: 'float2'}),
    param('yieldPA', 'Yield p.a.', 'coupon', {suffix: '%', pattern: 'float2'}),
    param('capCoupon', 'Cap Coupon', 'coupon', {suffix: '%', pattern: 'float2'}),
    param('floorCoupon', 'Floor Coupon', 'coupon', {suffix: '%', pattern: 'float2'}),
    param('condition', 'Rate Condition', 'coupon', {options: options(['Capped', 'Floored', 'Capped Floored', 'Fixed Rate', 'Floating Rate'])}),
    param('fixedRatePA', 'Fixed Rate p.a.', 'coupon', {backendKey: 'protectionRate', suffix: '%', pattern: 'float2'}),
    param('spreadPA', 'Spread', 'coupon', {backendKey: 'spreadPercentage', suffix: '%', pattern: 'float2'}),
    param('minimumReturn', 'Minimum Return', 'coupon', {options: yesNo, defaultValue: 'Yes'}),
    param('participationRate', 'Participation', 'coupon', {backendKey: 'participation', suffix: '%', pattern: 'float2', defaultValue: '100'}),
    param('principalProtection', 'Principal Protection', 'coupon', {suffix: '%', pattern: 'float2', defaultValue: '100'}),

    param('strike', 'Strike', 'price', {suffix: '%', pattern: 'float2', defaultValue: '100'}),
    param('notePrice', 'Note Price', 'price', {suffix: '%', pattern: 'float2', defaultValue: '99'}),
    param('nakedNotePrice', 'Naked Note Price', 'price', {valueType: 'number', suffix: '%', pattern: 'float2'}),
    param('issuePrice', 'Issue Price', 'price', {suffix: '%', pattern: 'float2', defaultValue: '99'}),
    param('uf', 'UF', 'price', {suffix: '%', pattern: 'float2'}),
    param('userUf', 'User UF', 'price', {valueType: 'number', suffix: 'bp', pattern: 'int'}),
    param('grossMargin', 'Gross Margin', 'price', {backendKey: 'grossMarginToClient', suffix: '%', pattern: 'float2'}),
    param('bidPrice', 'Bid', 'price', {suffix: '%', pattern: 'float2'}),
    param('offerPrice', 'Offer', 'price', {suffix: '%', pattern: 'float2'}),
    param('userPremium', 'Client Premium', 'price', {suffix: '%', pattern: 'float2'}),

    param('normalLeveraged', 'Normal / Leveraged', 'leverage', {options: options(['Normal', 'Leveraged']), defaultValue: 'Leveraged'}),
    param('leverage', 'Leverage', 'leverage', {backendKey: 'leverageLevel', suffix: '%', options: options(['150', '200']), defaultValue: '200'}),
    param('exercise', 'Exercise Style', 'leverage', {valueType: 'number', options: options(['0|European', '1|American']), defaultValue: '0'}),
    param('settlementType', 'Settlement', 'leverage', {valueType: 'number', options: options(['0|Cash', '1|Physical']), defaultValue: '1'}),
    param('issuerCallability', 'Issuer Call', 'leverage', {options: yesNo, defaultValue: 'Yes'}),
    param('nonCall', 'Non-call', 'leverage', {valueType: 'boolean', defaultValue: 'no'}),

    param('size', 'Size', 'size', {pattern: 'float2'}),
    param('denomination', 'Denomination', 'size', {pattern: 'int'}),
    param('sharesPerDay', 'Shares per Day', 'size', {pattern: 'float2'}),

    param('isin', 'ISIN', 'issuance'),
    param('valoren', 'Valoren', 'issuance'),
    param('issuerQuoteId', 'Issuer Quote ID', 'issuance'),
  ];

  const idOf = (key: string) => {
    const found = params.find((item) => item.key === key);
    if (!found) throw new Error(key);
    return found.id;
  };
  const ids = (...keys: string[]) => keys.map(idOf);

  function quoteOf(solveFor: string[], common: string[], advanced: string[]): QuoteConfig {
    const commonIds = ids(...common);
    for (const key of solveFor) {
      const id = idOf(key);
      if (!commonIds.includes(id) && !advanced.includes(key)) commonIds.push(id);
    }
    return {solveFor: ids(...solveFor), common: commonIds, advanced: ids(...advanced)};
  }

  function product(
    code: string,
    name: string,
    category: ProductCategory,
    keys: string[],
    quote: QuoteConfig,
  ): Catalog['products'][number] {
    const paramIds = ids(...keys);
    for (const id of [...quote.solveFor, ...quote.common, ...quote.advanced]) {
      if (!paramIds.includes(id)) paramIds.push(id);
    }
    return {id: `prod-${code}`, code, name, category, paramIds, quote, custom: false};
  }

  const noteBase = ['currency', 'underlying', 'tenor', 'strike', 'notePrice', 'effectiveDateOffset'];
  const products = [
    product('FCN', 'FCN', 'Notes', [...noteBase, 'koType', 'ko', 'couponPA', 'kiType', 'ki', 'observationFrequency', 'uf'], quoteOf(
      ['strike', 'couponPA', 'notePrice'],
      ['underlying', 'tenor', 'observationFrequency', 'couponPA', 'strike', 'ko', 'notePrice'],
      ['koType', 'kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('STEP_FCN', 'Step-down FCN', 'Notes', [...noteBase, 'guaranteedPeriods', 'koType', 'ko', 'koStepdown', 'couponPA', 'kiType', 'ki', 'observationFrequency', 'uf'], quoteOf(
      ['strike', 'couponPA', 'notePrice'],
      ['underlying', 'tenor', 'observationFrequency', 'couponPA', 'strike', 'ko', 'koStepdown', 'notePrice'],
      ['guaranteedPeriods', 'koType', 'kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('BEN', 'BEN', 'Notes', [...noteBase, 'bonus', 'kiType', 'ki', 'uf'], quoteOf(
      ['bonus', 'notePrice', 'strike'],
      ['underlying', 'tenor', 'bonus', 'strike', 'notePrice'],
      ['kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('DCN', 'DCN', 'Notes', [...noteBase, 'bonus', 'kiType', 'ki', 'uf'], quoteOf(
      ['bonus', 'notePrice', 'strike'],
      ['underlying', 'tenor', 'bonus', 'strike', 'notePrice'],
      ['kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('ELN', 'ELN', 'Notes', ['currency', 'underlying', 'tenor', 'strike', 'koType', 'ko', 'issuePrice', 'notePrice', 'yieldPA', 'issueDate', 'finalValuationDate', 'maturityDate', 'uf'], quoteOf(
      ['strike', 'issuePrice'],
      ['underlying', 'tenor', 'strike', 'ko', 'notePrice', 'yieldPA', 'issuePrice'],
      ['koType', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('WRA', 'WRA', 'Notes', [...noteBase, 'guaranteedPeriods', 'koType', 'ko', 'couponPA', 'kiType', 'ki', 'observationFrequency', 'uf'], quoteOf(
      ['strike', 'couponPA', 'notePrice'],
      ['underlying', 'tenor', 'observationFrequency', 'couponPA', 'strike', 'ko', 'notePrice'],
      ['guaranteedPeriods', 'koType', 'kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('STEP_SCN', 'Step-down SCN', 'Notes', [...noteBase, 'normalLeveraged', 'leverage', 'guaranteedPeriods', 'koType', 'ko', 'koStepdown', 'conditionalCouponPA', 'kiType', 'ki', 'observationFrequency', 'uf'], quoteOf(
      ['strike', 'conditionalCouponPA', 'notePrice'],
      ['underlying', 'tenor', 'observationFrequency', 'conditionalCouponPA', 'strike', 'ko', 'koStepdown', 'notePrice'],
      ['normalLeveraged', 'leverage', 'guaranteedPeriods', 'koType', 'kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('PHOENIX', 'Phoenix', 'Notes', [...noteBase, 'ko', 'koStepdown', 'couponType', 'couponBarrier', 'conditionalCouponPA', 'kiType', 'ki', 'observationFrequency', 'uf'], quoteOf(
      ['strike', 'conditionalCouponPA', 'notePrice'],
      ['underlying', 'tenor', 'observationFrequency', 'conditionalCouponPA', 'couponBarrier', 'strike', 'ko', 'koStepdown', 'notePrice'],
      ['couponType', 'kiType', 'ki', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('SHARKFIN', 'Sharkfin', 'Notes', [...noteBase, 'direction', 'couponKoType', 'upperBarrier', 'lowerBarrier', 'cashRebate', 'minimumReturn', 'floorCoupon', 'principalProtection', 'participationRate', 'format', 'uf'], quoteOf(
      ['upperBarrier', 'cashRebate', 'notePrice'],
      ['underlying', 'direction', 'tenor', 'upperBarrier', 'lowerBarrier', 'cashRebate', 'minimumReturn', 'floorCoupon', 'strike', 'notePrice'],
      ['couponKoType', 'principalProtection', 'participationRate', 'format', 'currency', 'uf', 'effectiveDateOffset'],
    )),
    product('AQ', 'AQ', 'OTC', ['underlying', 'tenor', 'normalLeveraged', 'guaranteedPeriods', 'strike', 'ko', 'userUf', 'uf', 'settlementFrequency', 'koSettlementCycle', 'guaranteedDays', 'totalDays', 'sharesPerDay'], quoteOf(
      ['strike', 'uf'],
      ['underlying', 'tenor', 'ko', 'strike', 'totalDays'],
      ['normalLeveraged', 'settlementFrequency', 'guaranteedPeriods', 'uf', 'userUf'],
    )),
    product('DQ', 'DQ', 'OTC', ['underlying', 'tenor', 'normalLeveraged', 'guaranteedPeriods', 'strike', 'ko', 'userUf', 'uf', 'settlementFrequency', 'koSettlementCycle', 'guaranteedDays', 'totalDays', 'sharesPerDay'], quoteOf(
      ['strike', 'uf'],
      ['underlying', 'tenor', 'ko', 'strike', 'totalDays'],
      ['normalLeveraged', 'settlementFrequency', 'guaranteedPeriods', 'uf', 'userUf'],
    )),
    product('VAN', 'VAN', 'OTC', ['currency', 'underlying', 'tenor', 'strike', 'optionType', 'bidPrice', 'offerPrice', 'finalValuationDate', 'exercise', 'settlementType', 'userPremium', 'uf'], quoteOf(
      ['strike', 'bidPrice', 'offerPrice'],
      ['underlying', 'strike', 'optionType', 'bidPrice', 'offerPrice', 'finalValuationDate', 'exercise', 'userPremium'],
      ['currency', 'tenor', 'settlementType', 'uf'],
    )),
    product('PP', 'Performance Participation', 'Other', [...noteBase, 'direction', 'capCoupon', 'principalProtection', 'participationRate', 'format'], quoteOf(
      ['participationRate', 'capCoupon', 'notePrice'],
      ['underlying', 'direction', 'tenor', 'strike', 'participationRate', 'capCoupon', 'notePrice'],
      ['principalProtection', 'format', 'currency', 'effectiveDateOffset'],
    )),
    product('SKYLINE', 'Skyline', 'Other', [...noteBase, 'direction', 'couponKoType', 'upperBarrier', 'lowerBarrier', 'capCoupon', 'floorCoupon', 'principalProtection'], quoteOf(
      ['capCoupon', 'floorCoupon', 'notePrice'],
      ['underlying', 'direction', 'tenor', 'upperBarrier', 'lowerBarrier', 'capCoupon', 'floorCoupon', 'strike', 'notePrice'],
      ['couponKoType', 'principalProtection', 'currency', 'effectiveDateOffset'],
    )),
    product('FLOATER', 'Floater', 'Other', ['currency', 'underlying', 'tenor', 'notePrice', 'issuerCallability', 'nonCallPeriod', 'callableFrequency', 'condition', 'capCoupon', 'floorCoupon', 'couponPaymentFrequency', 'principalProtection', 'effectiveDateOffset'], quoteOf(
      ['notePrice', 'capCoupon', 'floorCoupon'],
      ['underlying', 'tenor', 'condition', 'capCoupon', 'floorCoupon', 'couponPaymentFrequency', 'notePrice'],
      ['issuerCallability', 'nonCallPeriod', 'callableFrequency', 'principalProtection', 'currency', 'effectiveDateOffset'],
    )),
    product('VANILLA_BOND', 'Vanilla Bond', 'Other', ['currency', 'underlying', 'tenor', 'notePrice', 'condition', 'spreadPA', 'fixedRatePA', 'issuerCallability', 'nonCallPeriod', 'callableFrequency', 'couponPaymentFrequency', 'principalProtection', 'effectiveDateOffset'], quoteOf(
      ['notePrice', 'fixedRatePA', 'spreadPA'],
      ['underlying', 'tenor', 'condition', 'fixedRatePA', 'spreadPA', 'couponPaymentFrequency', 'notePrice'],
      ['issuerCallability', 'nonCallPeriod', 'callableFrequency', 'principalProtection', 'currency', 'effectiveDateOffset'],
    )),
  ];

  return {params, products};
}
