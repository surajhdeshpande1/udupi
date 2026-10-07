/* Udupi Coast Trip: sat. */
'use strict';
TRIP.DAYS.push({ id:`sat`, date:`2026-10-10`, tab:`Sat 10`, short:`Sat`, eyebrow:`Saturday 10 October · on the train`, name:`Home`,
  sub:`Wake up in north Karnataka.`,
  hl:[`Ghats overnight`,`Home by 08:15`],
  briefLine:`Bagalkot 07:58 · home by 08:15`,
  brief:[
    [`train`,`Route`,`17378 overnight: Hubballi 04:40, Gadag 06:25, Badami 07:29, Guledagudda Road 07:44, Bagalkot 07:58.`],
    [`clock`,`Wake`,`Alarm at 07:10. Ready by Badami (07:29), at the door by Guledagudda Road (07:44).`],
    [`bag`,`Check`,`Under the berth, the charging point and the window ledge before you stand up. Phone, wallet, ID, keys.`],
    [`leaf`,`Eat`,`Breakfast at home; tea from the platform vendor at Gadag or Badami if you are up.`],
    [`shield`,`Watch for`,`A late running train: NTES shows the live ETA, so set the alarm by it.`]
  ],
  planB:[ `Running late: NTES shows the live ETA. Badami (07:29) and Guledagudda Road (07:44) are your cues to get ready.` ],
  items:[
    {id:`sa1`,t:`04:40`,k:`stop`,info:1,x:`Hubballi (sleep through)`},
    {id:`sa2`,t:`06:25`,k:`stop`,info:1,x:`Gadag`},
    {id:`sa3`,t:`07:10`,k:`rest`,x:`Alarm: wash up, fold the berth`,steps:[`Check NTES for the live ETA`,`Wash up before the queue`,`Fold the bedding and pack the daypack`]},
    {id:`sa4`,t:`07:29`,k:`stop`,info:1,x:`Badami`},
    {id:`sa5`,t:`07:44`,k:`train`,x:`Guledagudda Road: bags on, move to the door`,steps:[`Look under the berth and on the window ledge`,`Bag on, phone and wallet on you`,`Move to the door with your coach mates`]},
    {id:`sa6`,t:`07:58`,k:`train`,fix:1,x:`Arrive Bagalkot`,kn:`ಬಾಗಲಕೋಟೆ`},
    {id:`sa7`,t:`08:15`,k:`move`,x:`Home`,c:[50,100],b:`Trip complete.`}
  ]});
