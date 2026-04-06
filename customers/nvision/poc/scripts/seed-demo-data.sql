-- nVision Demo Seed Data
-- Generated: 2026-04-04
-- Author: Trinity (Backend Dev)
-- Purpose: Realistic demo data with 50 patients, 3 templates, 2 campaigns, tone variants, and mock metrics

-- ===========================================================================
-- SEED 50 PATIENTS (Mix of LASIK, Cataract, Premium Lens)
-- ===========================================================================

-- LASIK Patients (20 total)
INSERT INTO patients (salesforce_id, first_name, last_name, email, phone, procedure_interest, last_visit_date, consultation_notes, call_recording_summary, engagement_score, preferred_channel) VALUES
('003Dn00000A1001', 'Sarah', 'Mitchell', 'sarah.mitchell@email.com', '(555) 123-4567', 'LASIK', '2025-11-15', 'Patient expressed strong interest in LASIK. Main concern is night driving glare. Currently wears glasses for distance. Active lifestyle, plays tennis 3x/week. Wants procedure before vacation in March.', 'Patient called to ask about recovery time. Mentioned upcoming ski trip and can she drive at night after LASIK. Very concerned about night vision quality post-procedure.', 87, 'both'),
('003Dn00000A1002', 'David', 'Thompson', 'david.thompson@gmail.com', '(555) 234-5678', 'LASIK', '2025-10-22', 'Very motivated patient. Plays basketball recreationally. Tired of glasses fogging up during games. Works as software developer, screens all day. Concerned about dry eyes post-op.', 'Follow-up call about getting back to basketball. Asked specific questions about protective eyewear during sports recovery period.', 91, 'email'),
('003Dn00000A1003', 'Jennifer', 'Rodriguez', 'j.rodriguez@outlook.com', '(555) 345-6789', 'LASIK', '2025-12-01', 'Elementary school teacher. Wants to see students clearly without glasses. Mentioned allergies make contact lenses difficult. Budget-conscious, asked about financing options.', 'Called to inquire about payment plans. Mentioned teacher salary constraints but very interested in procedure.', 78, 'both'),
('003Dn00000A1004', 'Michael', 'Anderson', 'manderson@yahoo.com', '(555) 456-7890', 'LASIK', '2025-09-18', 'Firefighter. Safety concerns about glasses during emergency calls. High prescription (-7.00 both eyes). Previous consultation 2 years ago, now ready to proceed.', 'Mentioned promotion to captain, needs better vision for leadership role. Asked about recovery time before returning to active duty.', 82, 'sms'),
('003Dn00000A1005', 'Emily', 'Williams', 'emily.w@protonmail.com', '(555) 567-8901', 'LASIK', '2025-11-30', 'Yoga instructor. Wants freedom from glasses during classes. Concerned about healing time affecting teaching schedule. Interested in PRK as alternative.', 'Asked detailed questions about PRK vs LASIK for active lifestyle. Wants to avoid any risk during downward dog poses.', 73, 'email'),
('003Dn00000A1006', 'James', 'Taylor', 'jtaylor@company.com', '(555) 678-9012', 'LASIK', '2025-10-05', 'Corporate executive. Tired of reading glasses for presentations. Mild presbyopia starting. Discussed monovision LASIK option for near/far correction.', 'Called about monovision outcomes. Concerned about depth perception for golf hobby.', 65, 'email'),
('003Dn00000A1007', 'Ashley', 'Martinez', 'ashley.m.123@gmail.com', '(555) 789-0123', 'LASIK', '2025-12-10', 'College student. Parents agreed to pay for graduation gift. Wants procedure during summer break. Moderate myopia, good candidate. Very excited.', 'Follow-up about summer scheduling. Asked if she can swim in ocean after 2 weeks recovery.', 94, 'sms'),
('003Dn00000A1008', 'Christopher', 'Brown', 'cbrown@email.net', '(555) 890-1234', 'LASIK', '2025-11-08', 'Pilot (private license). Needs to meet FAA vision requirements without corrective lenses for commercial certification. Highly motivated, detail-oriented questions.', 'Discussed FAA approval timeline post-LASIK. Needs documentation for aviation medical examiner.', 89, 'email'),
('003Dn00000A1009', 'Jessica', 'Davis', 'jdavis.realtor@gmail.com', '(555) 901-2345', 'LASIK', '2025-09-25', 'Real estate agent. Frequently showing homes, sunglasses over prescription glasses inconvenient. Wants natural vision for client meetings.', 'Asked about recovery time before major listing presentation next month.', 71, 'both'),
('003Dn00000A1010', 'Daniel', 'Wilson', 'd.wilson@techcorp.io', '(555) 012-3456', 'LASIK', '2025-12-15', 'Tech startup founder. Long hours in front of screens. Dry eye issues with contacts. Explored LASIK 5 years ago but technology has improved. Ready now.', 'Mentioned recent funding round, can now afford premium options. Asked about bladeless LASIK advantages.', 80, 'email'),
('003Dn00000A1011', 'Amanda', 'Garcia', 'amanda.garcia@university.edu', '(555) 111-2222', 'LASIK', '2025-10-12', 'PhD student in chemistry. Lab safety glasses over prescription glasses cumbersome. Wants LASIK before dissertation defense year.', 'Called about lab work restrictions post-op. Chemical fume exposure concerns during healing.', 76, 'email'),
('003Dn00000A1012', 'Ryan', 'Moore', 'rmoore.fit@gmail.com', '(555) 222-3333', 'LASIK', '2025-11-20', 'Personal trainer. Glasses fall off during client sessions. Contacts dry out in gym environment. Active crossfit competitor.', 'Asked about returning to heavy lifting and high-intensity workouts. Timeline for competition training.', 85, 'sms'),
('003Dn00000A1013', 'Lauren', 'Johnson', 'ljohnson@lawfirm.com', '(555) 333-4444', 'LASIK', '2025-12-03', 'Attorney. Court appearances require professional appearance. Prefers not wearing glasses. Concerned about recovery time during trial season.', 'Follow-up about scheduling around major trial in February. Needs quick recovery option.', 68, 'email'),
('003Dn00000A1014', 'Brandon', 'Lee', 'blee.photography@gmail.com', '(555) 444-5555', 'LASIK', '2025-09-30', 'Wedding photographer. Glasses interfere with camera viewfinder. Needs perfect vision for critical moments. Worried about light sensitivity post-op.', 'Asked about photophobia duration and timeline to return to flash photography work.', 79, 'both'),
('003Dn00000A1015', 'Stephanie', 'White', 'swhite@nursingstaff.org', '(555) 555-6666', 'LASIK', '2025-11-12', 'ER nurse. 12-hour shifts, glasses uncomfortable with mask wearing. Contacts not ideal for sterile environment. Practical healthcare worker.', 'Called about infection risk during healing in hospital environment. PPE compatibility questions.', 83, 'email'),
('003Dn00000A1016', 'Kevin', 'Harris', 'kharris.outdoors@yahoo.com', '(555) 666-7777', 'LASIK', '2025-10-28', 'Outdoor adventure guide. Leads hiking and camping trips. Glasses constantly dirty/foggy in wilderness. Wants permanent solution for backcountry work.', 'Asked about dust exposure during healing. Upcoming 2-week expedition timeline concerns.', 77, 'sms'),
('003Dn00000A1017', 'Megan', 'Clark', 'mclark.teacher@school.org', '(555) 777-8888', 'LASIK', '2025-12-08', 'High school teacher. Glasses make her look older than students prefer. Wants more youthful appearance. Also practical vision improvement.', 'Follow-up about summer break scheduling. Wants procedure in June for August school start.', 72, 'email'),
('003Dn00000A1018', 'Justin', 'Lewis', 'jlewis.gamer@twitch.tv', '(555) 888-9999', 'LASIK', '2025-11-25', 'Professional esports player. Extended screen time, blue light concerns. Glasses create glare on streams. Wants optimal vision for competitive gaming.', 'Asked about screen time restrictions post-op. Tournament schedule conflicts.', 88, 'sms'),
('003Dn00000A1019', 'Nicole', 'Walker', 'nwalker.vet@animalcare.com', '(555) 999-0000', 'LASIK', '2025-10-15', 'Veterinarian. Glasses constantly being knocked off by animals. Contacts problematic with animal dander allergies. Needs durable vision solution.', 'Called about animal exposure during recovery period. Clinic scheduling for 3-day break.', 81, 'both'),
('003Dn00000A1020', 'Tyler', 'Hall', 'tyler.hall@consulting.biz', '(555) 000-1111', 'LASIK', '2025-12-18', 'Management consultant. Frequent travel, packing multiple glasses/contacts annoying. Wants simplicity. International client meetings require sharp appearance.', 'Asked about vision stability for long flights post-op. Business travel schedule coordination.', 74, 'email'),

-- Cataract Patients (15 total)
('003Dn00000A2001', 'Robert', 'Chen', 'robert.chen@retired.net', '(555) 100-2000', 'Cataract', '2025-11-05', 'Retired engineer, age 68. Cataracts in both eyes affecting driving safety. Wife concerned about his night driving. Reads extensively, vision declining for hobbies.', 'Very concerned about recovery time. Mentioned upcoming grandchild visit, wants to see clearly. Asked about driving restrictions post-surgery.', 72, 'sms'),
('003Dn00000A2002', 'Margaret', 'Patterson', 'mpatterson@oldmail.com', '(555) 200-3000', 'Cataract', '2025-10-20', 'Age 71, active volunteer. Cataracts making it difficult to read to children at library. Frustrated by declining quality of life. Doctor referred for surgery.', 'Follow-up about premium lens options. Budget on fixed income but interested in reducing glasses dependency.', 67, 'email'),
('003Dn00000A2003', 'William', 'Foster', 'bill.foster@gmail.com', '(555) 300-4000', 'Cataract', '2025-12-01', 'Age 65, still working as accountant. Cataracts interfering with detailed financial work. Concerned about taking time off during tax season.', 'Asked about scheduling surgery between tax deadlines. Needs quick recovery for spreadsheet work.', 70, 'email'),
('003Dn00000A2004', 'Dorothy', 'Hughes', 'dorothy.h@senior.org', '(555) 400-5000', 'Cataract', '2025-11-18', 'Age 73, lives independently. Cataracts causing falls due to poor depth perception. Daughter insists on surgery for safety. Medicare coverage questions.', 'Called about Medicare authorization process. Daughter on call helping navigate insurance.', 58, 'both'),
('003Dn00000A2005', 'Richard', 'Bennett', 'rbennett.golf@yahoo.com', '(555) 500-6000', 'Cataract', '2025-10-08', 'Age 69, avid golfer. Cataracts affecting ability to track ball flight. Interested in premium lens for golf vision. Active lifestyle maintenance priority.', 'Asked about premium lens benefits for golf. Wants best distance vision without glasses.', 75, 'email'),
('003Dn00000A2006', 'Barbara', 'Sanders', 'bsanders@quilting.com', '(555) 600-7000', 'Cataract', '2025-12-12', 'Age 70, quilting hobbyist. Cataracts making detailed needlework impossible. Colors appear faded. Wants vibrant vision restored for crafts.', 'Follow-up about near vision for close handwork. Interested in monovision or multifocal lens.', 69, 'email'),
('003Dn00000A2007', 'Joseph', 'Coleman', 'joe.coleman@veteran.gov', '(555) 700-8000', 'Cataract', '2025-11-28', 'Age 74, military veteran. Cataracts bilateral, moderate severity. VA benefits cover surgery. Wants to maintain independence and driving ability.', 'VA authorization in progress. Asked about timeline and coordination with VA hospital.', 64, 'sms'),
('003Dn00000A2008', 'Patricia', 'Reed', 'patricia.reed@bridge.club', '(555) 800-9000', 'Cataract', '2025-10-25', 'Age 68, bridge player. Cataracts making it hard to see cards clearly. Social activities declining. Husband had successful cataract surgery last year.', 'Husband recommends this practice. Asked to schedule both eyes close together for faster recovery.', 73, 'email'),
('003Dn00000A2009', 'Thomas', 'Brooks', 'tbrooks.woodwork@gmail.com', '(555) 900-0001', 'Cataract', '2025-12-05', 'Age 67, woodworking enthusiast. Cataracts creating safety concerns with power tools. Depth perception issues. Needs clear vision for precision work.', 'Asked about recovery timeline before using workshop equipment. Safety is top priority.', 71, 'both'),
('003Dn00000A2010', 'Helen', 'Morgan', 'helen.morgan@garden.org', '(555) 000-1112', 'Cataract', '2025-11-10', 'Age 72, master gardener. Cataracts affecting ability to identify plants and pests. Outdoor activities limited by glare sensitivity. Loves gardening therapy.', 'Called about UV protection post-surgery. Wants to return to outdoor gardening quickly.', 66, 'email'),
('003Dn00000A2011', 'Charles', 'Powell', 'cpowell@fishing.net', '(555) 111-2223', 'Cataract', '2025-10-18', 'Age 70, fishing guide. Cataracts making it difficult to see fish and navigate boat safely. Business income depends on good vision. Needs surgery soon.', 'Very motivated for quick recovery. Fishing season starts in spring, wants surgery now.', 78, 'sms'),
('003Dn00000A2012', 'Linda', 'Perry', 'lperry.artist@studio.com', '(555) 222-3334', 'Cataract', '2025-12-15', 'Age 69, watercolor artist. Cataracts distorting color perception. Frustrating for professional work. Concerned about preserving color vision quality.', 'Asked about color vision restoration. Wants to return to painting with accurate hues.', 68, 'email'),
('003Dn00000A2013', 'Frank', 'Russell', 'frank.r@birdwatch.org', '(555) 333-4445', 'Cataract', '2025-11-22', 'Age 71, bird watching enthusiast. Cataracts making binocular use difficult. Misses identifying rare species. Active in local Audubon chapter.', 'Follow-up about distance vision clarity. Needs sharp far vision for birding hobby.', 70, 'email'),
('003Dn00000A2014', 'Carol', 'Gray', 'cgray.librarian@public.lib', '(555) 444-5556', 'Cataract', '2025-12-20', 'Age 68, retiring librarian. Wants clear vision for retirement travel plans. Cataracts worsening, doctor recommended surgery before extensive travel.', 'Asked about international travel timeline post-op. Planning European trip in 6 months.', 65, 'both'),
('003Dn00000A2015', 'George', 'Simmons', 'gsimmons@sailing.club', '(555) 555-6667', 'Cataract', '2025-10-30', 'Age 73, sailor. Cataracts affecting navigation and safety on water. Glare from water surface problematic. Needs surgery before sailing season.', 'Called about water exposure during healing. When can he return to sailing activities.', 74, 'sms'),

-- Premium Lens Patients (15 total)
('003Dn00000A3001', 'Maria', 'Garcia', 'maria.garcia@executive.com', '(555) 150-2500', 'Premium Lens', '2025-11-15', 'Age 62, executive assistant. Tired of reading glasses for computer work. Interested in premium IOL to reduce glasses dependency. Cataract developing.', 'Asked detailed questions about multifocal vs extended depth of focus lenses. Cost is secondary to quality of vision.', 35, 'email'),
('003Dn00000A3002', 'Steven', 'Murphy', 'smurphy.architect@design.com', '(555) 250-3500', 'Premium Lens', '2025-12-02', 'Age 64, architect. Needs both near vision for blueprints and distance for site visits. Early cataracts. Premium lens ideal candidate.', 'Follow-up about premium lens options for professional work. Wants minimal glasses use.', 79, 'both'),
('003Dn00000A3003', 'Nancy', 'Cooper', 'ncooper.writer@books.com', '(555) 350-4500', 'Premium Lens', '2025-10-22', 'Age 61, novelist. Extensive reading and writing. Presbyopia frustrating. Exploring premium lens with early cataract. Wants freedom from readers.', 'Asked about near vision quality with premium lenses. Reading is her livelihood.', 72, 'email'),
('003Dn00000A3004', 'Paul', 'Richardson', 'paul.r@jeweler.net', '(555) 450-5500', 'Premium Lens', '2025-11-28', 'Age 63, jeweler. Needs exceptional near vision for detailed work. Also distance for customer interactions. Premium lens could be career-extending.', 'Very interested in best near vision option. Asked about toric premium lens for astigmatism.', 81, 'email'),
('003Dn00000A3005', 'Sandra', 'Watson', 'swatson.designer@fashion.com', '(555) 550-6500', 'Premium Lens', '2025-12-10', 'Age 60, fashion designer. Fabric inspection requires sharp near vision. Runway shows need good distance. Early cataracts, perfect timing for premium.', 'Follow-up about color perception with premium lenses. Critical for her design work.', 76, 'both'),
('003Dn00000A3006', 'Gregory', 'Barnes', 'gbarnes@dental.practice', '(555) 650-7500', 'Premium Lens', '2025-10-15', 'Age 65, dentist near retirement. Patient care requires precise near vision. Tired of switching between readers and distance glasses all day.', 'Asked about extended depth of focus lens for dental work. Wants continuous vision range.', 70, 'email'),
('003Dn00000A3007', 'Deborah', 'Henderson', 'dhenderson.chef@culinary.com', '(555) 750-8500', 'Premium Lens', '2025-11-20', 'Age 62, executive chef. Reading recipes and seeing dining room both important. Presbyopia plus early cataracts. Interested in premium options.', 'Called about premium lens benefits for kitchen work. Hot environment concerns during recovery.', 68, 'sms'),
('003Dn00000A3008', 'Kenneth', 'Young', 'kyoung.pilot@aviation.com', '(555) 850-9500', 'Premium Lens', '2025-12-08', 'Age 64, airline pilot approaching retirement. Needs optimal vision for cockpit instruments and distance. Early cataracts detected in FAA physical.', 'Asked about FAA approval for premium lenses. Aviation medical certificate renewal timeline.', 77, 'email'),
('003Dn00000A3009', 'Betty', 'King', 'bking.piano@music.edu', '(555) 950-0500', 'Premium Lens', '2025-10-28', 'Age 63, piano teacher. Reading sheet music plus seeing students across room. Bifocals annoying. Premium lens could improve teaching.', 'Follow-up about music reading clarity. Needs sharp intermediate vision for piano distance.', 73, 'email'),
('003Dn00000A3010', 'Donald', 'Wright', 'dwright@antiques.shop', '(555) 050-1500', 'Premium Lens', '2025-11-12', 'Age 66, antique dealer. Examining fine details and authentication requires excellent near vision. Also gallery displays need distance clarity.', 'Asked about premium lens for antique appraisal work. Wants best possible vision quality.', 71, 'both'),
('003Dn00000A3011', 'Michelle', 'Lopez', 'mlopez.surgeon@hospital.org', '(555) 160-2600', 'Premium Lens', '2025-12-18', 'Age 61, surgeon. Surgical precision demands excellent vision at multiple distances. Early presbyopia interfering with career. Premium lens essential.', 'Discussed premium lens options for surgical work. Wants cutting-edge technology.', 84, 'email'),
('003Dn00000A3012', 'Edward', 'Hill', 'ehill.watchmaker@time.com', '(555) 260-3600', 'Premium Lens', '2025-10-20', 'Age 67, watchmaker. Microscopic detail work all day. Early cataracts plus presbyopia. Premium lens could extend career significantly.', 'Very detailed questions about near vision quality. Watchmaking requires absolute clarity.', 75, 'email'),
('003Dn00000A3013', 'Karen', 'Scott', 'kscott.pilot@private.jet', '(555) 360-4600', 'Premium Lens', '2025-11-25', 'Age 60, private pilot. Instrument panel and distance vision both critical. Early cataracts, wants premium lens for optimal aviation vision.', 'Asked about premium lens for flying. FAA requirements and timeline questions.', 78, 'sms'),
('003Dn00000A3014', 'Mark', 'Green', 'mgreen@restoration.art', '(555) 460-5600', 'Premium Lens', '2025-12-12', 'Age 64, art restorer. Museum work requires exceptional color and detail vision. Early cataracts threatening career. Premium lens is investment.', 'Follow-up about color accuracy with premium lenses. UV protection for art preservation work.', 69, 'email'),
('003Dn00000A3015', 'Lisa', 'Adams', 'ladams.editor@publishing.com', '(555) 560-6600', 'Premium Lens', '2025-11-08', 'Age 62, book editor. Hours of reading manuscripts plus computer work. Progressive lenses inadequate. Premium IOL could be life-changing.', 'Asked about reading comfort with premium lenses. Needs sustained near vision for work.', 74, 'both');

-- ===========================================================================
-- PATIENT DEMOGRAPHICS (new fields: dob, gender, city, insurance, lead_source, etc.)
-- ===========================================================================
-- LASIK patients (IDs match salesforce_id order)
UPDATE patients SET date_of_birth='1994-03-15', gender='Female', city='Los Angeles', state='CA', insurance_provider='Blue Cross', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2025-12-20', lifetime_value=250 WHERE salesforce_id='003Dn00000A1001';
UPDATE patients SET date_of_birth='1990-07-22', gender='Male', city='San Diego', state='CA', insurance_provider='Aetna', lead_source='Referral', appointment_status='consultation_done', last_contacted='2025-11-15', lifetime_value=500 WHERE salesforce_id='003Dn00000A1002';
UPDATE patients SET date_of_birth='1988-11-08', gender='Female', city='Riverside', state='CA', insurance_provider='Kaiser', lead_source='Facebook', appointment_status='consultation_done', last_contacted='2026-01-10', lifetime_value=150 WHERE salesforce_id='003Dn00000A1003';
UPDATE patients SET date_of_birth='1985-01-30', gender='Male', city='Orange', state='CA', insurance_provider='United Health', lead_source='Walk-in', appointment_status='follow_up_scheduled', last_contacted='2025-10-08', lifetime_value=300 WHERE salesforce_id='003Dn00000A1004';
UPDATE patients SET date_of_birth='1992-06-14', gender='Female', city='Irvine', state='CA', insurance_provider='Cigna', lead_source='Instagram', appointment_status='consultation_done', last_contacted='2026-01-05', lifetime_value=200 WHERE salesforce_id='003Dn00000A1005';
UPDATE patients SET date_of_birth='1975-09-03', gender='Male', city='Newport Beach', state='CA', insurance_provider='Aetna', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2025-11-20', lifetime_value=1200 WHERE salesforce_id='003Dn00000A1006';
UPDATE patients SET date_of_birth='2003-04-25', gender='Female', city='Pasadena', state='CA', insurance_provider='Blue Shield', lead_source='TikTok', appointment_status='consultation_done', last_contacted='2026-01-15', lifetime_value=0 WHERE salesforce_id='003Dn00000A1007';
UPDATE patients SET date_of_birth='1982-12-19', gender='Male', city='Long Beach', state='CA', insurance_provider='United Health', lead_source='Referral', appointment_status='procedure_scheduled', last_contacted='2025-12-01', lifetime_value=800 WHERE salesforce_id='003Dn00000A1008';
UPDATE patients SET date_of_birth='1987-08-11', gender='Female', city='Anaheim', state='CA', insurance_provider='Anthem', lead_source='Zillow Partner', appointment_status='consultation_done', last_contacted='2025-10-30', lifetime_value=350 WHERE salesforce_id='003Dn00000A1009';
UPDATE patients SET date_of_birth='1980-02-28', gender='Male', city='San Francisco', state='CA', insurance_provider='Blue Cross', lead_source='Google Ads', appointment_status='follow_up_scheduled', last_contacted='2026-01-20', lifetime_value=2500 WHERE salesforce_id='003Dn00000A1010';
UPDATE patients SET date_of_birth='1995-05-20', gender='Female', city='Berkeley', state='CA', insurance_provider='Kaiser', lead_source='University Program', appointment_status='consultation_done', last_contacted='2025-11-25', lifetime_value=100 WHERE salesforce_id='003Dn00000A1011';
UPDATE patients SET date_of_birth='1991-10-07', gender='Male', city='Santa Monica', state='CA', insurance_provider='Cigna', lead_source='Instagram', appointment_status='follow_up_scheduled', last_contacted='2025-12-10', lifetime_value=450 WHERE salesforce_id='003Dn00000A1012';
UPDATE patients SET date_of_birth='1983-03-18', gender='Female', city='Beverly Hills', state='CA', insurance_provider='Aetna', lead_source='Referral', appointment_status='consultation_done', last_contacted='2026-01-08', lifetime_value=900 WHERE salesforce_id='003Dn00000A1013';
UPDATE patients SET date_of_birth='1989-07-02', gender='Male', city='Glendale', state='CA', insurance_provider='Blue Shield', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2025-10-20', lifetime_value=600 WHERE salesforce_id='003Dn00000A1014';
UPDATE patients SET date_of_birth='1990-01-28', gender='Female', city='Torrance', state='CA', insurance_provider='United Health', lead_source='Walk-in', appointment_status='procedure_scheduled', last_contacted='2025-12-15', lifetime_value=350 WHERE salesforce_id='003Dn00000A1015';
UPDATE patients SET date_of_birth='1986-11-14', gender='Male', city='Mammoth Lakes', state='CA', insurance_provider='Anthem', lead_source='Yelp', appointment_status='consultation_done', last_contacted='2025-11-05', lifetime_value=200 WHERE salesforce_id='003Dn00000A1016';
UPDATE patients SET date_of_birth='1993-09-09', gender='Female', city='Burbank', state='CA', insurance_provider='Kaiser', lead_source='Facebook', appointment_status='no_show', last_contacted='2026-01-12', lifetime_value=0 WHERE salesforce_id='003Dn00000A1017';
UPDATE patients SET date_of_birth='1998-04-30', gender='Male', city='San Jose', state='CA', insurance_provider='Blue Cross', lead_source='Twitch', appointment_status='consultation_done', last_contacted='2025-12-05', lifetime_value=150 WHERE salesforce_id='003Dn00000A1018';
UPDATE patients SET date_of_birth='1984-06-17', gender='Female', city='Sacramento', state='CA', insurance_provider='Cigna', lead_source='Referral', appointment_status='follow_up_scheduled', last_contacted='2025-10-25', lifetime_value=700 WHERE salesforce_id='003Dn00000A1019';
UPDATE patients SET date_of_birth='1979-08-23', gender='Male', city='Fresno', state='CA', insurance_provider='Aetna', lead_source='LinkedIn', appointment_status='consultation_done', last_contacted='2026-01-18', lifetime_value=1800 WHERE salesforce_id='003Dn00000A1020';
-- Cataract patients
UPDATE patients SET date_of_birth='1957-02-14', gender='Male', city='Pasadena', state='CA', insurance_provider='Medicare', lead_source='Doctor Referral', appointment_status='procedure_scheduled', last_contacted='2025-12-01', lifetime_value=3500 WHERE salesforce_id='003Dn00000A2001';
UPDATE patients SET date_of_birth='1954-08-30', gender='Female', city='San Diego', state='CA', insurance_provider='Medicare', lead_source='Community Event', appointment_status='consultation_done', last_contacted='2025-11-18', lifetime_value=1200 WHERE salesforce_id='003Dn00000A2002';
UPDATE patients SET date_of_birth='1960-12-05', gender='Male', city='Irvine', state='CA', insurance_provider='Medicare + Supplement', lead_source='Referral', appointment_status='follow_up_scheduled', last_contacted='2026-01-10', lifetime_value=2800 WHERE salesforce_id='003Dn00000A2003';
UPDATE patients SET date_of_birth='1952-04-18', gender='Female', city='Riverside', state='CA', insurance_provider='Medicare', lead_source='Doctor Referral', appointment_status='consultation_done', last_contacted='2025-12-08', lifetime_value=800 WHERE salesforce_id='003Dn00000A2004';
UPDATE patients SET date_of_birth='1956-06-22', gender='Male', city='Palm Springs', state='CA', insurance_provider='AARP/United', lead_source='Mailer', appointment_status='procedure_scheduled', last_contacted='2025-10-28', lifetime_value=4200 WHERE salesforce_id='003Dn00000A2005';
UPDATE patients SET date_of_birth='1955-10-12', gender='Female', city='Orange', state='CA', insurance_provider='Medicare', lead_source='Facebook', appointment_status='consultation_done', last_contacted='2026-01-02', lifetime_value=1500 WHERE salesforce_id='003Dn00000A2006';
UPDATE patients SET date_of_birth='1951-03-08', gender='Male', city='Long Beach', state='CA', insurance_provider='VA/Tricare', lead_source='VA Referral', appointment_status='waiting_authorization', last_contacted='2025-12-15', lifetime_value=0 WHERE salesforce_id='003Dn00000A2007';
UPDATE patients SET date_of_birth='1957-07-25', gender='Female', city='Newport Beach', state='CA', insurance_provider='AARP/United', lead_source='Referral', appointment_status='procedure_scheduled', last_contacted='2025-11-10', lifetime_value=3800 WHERE salesforce_id='003Dn00000A2008';
UPDATE patients SET date_of_birth='1958-11-30', gender='Male', city='Anaheim', state='CA', insurance_provider='Medicare + Supplement', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2026-01-05', lifetime_value=2200 WHERE salesforce_id='003Dn00000A2009';
UPDATE patients SET date_of_birth='1953-05-16', gender='Female', city='Santa Barbara', state='CA', insurance_provider='Medicare', lead_source='Community Event', appointment_status='follow_up_scheduled', last_contacted='2025-12-20', lifetime_value=900 WHERE salesforce_id='003Dn00000A2010';
UPDATE patients SET date_of_birth='1955-09-04', gender='Male', city='San Francisco', state='CA', insurance_provider='Blue Cross', lead_source='Yelp', appointment_status='procedure_scheduled', last_contacted='2025-11-22', lifetime_value=5100 WHERE salesforce_id='003Dn00000A2011';
UPDATE patients SET date_of_birth='1956-01-20', gender='Female', city='Laguna Beach', state='CA', insurance_provider='Medicare', lead_source='Referral', appointment_status='consultation_done', last_contacted='2026-01-14', lifetime_value=1800 WHERE salesforce_id='003Dn00000A2012';
UPDATE patients SET date_of_birth='1954-04-11', gender='Male', city='Ventura', state='CA', insurance_provider='AARP/United', lead_source='Mailer', appointment_status='follow_up_scheduled', last_contacted='2025-12-28', lifetime_value=1400 WHERE salesforce_id='003Dn00000A2013';
UPDATE patients SET date_of_birth='1957-08-07', gender='Female', city='Bakersfield', state='CA', insurance_provider='Medicare + Supplement', lead_source='Doctor Referral', appointment_status='consultation_done', last_contacted='2026-01-20', lifetime_value=600 WHERE salesforce_id='003Dn00000A2014';
UPDATE patients SET date_of_birth='1952-12-03', gender='Male', city='Marina del Rey', state='CA', insurance_provider='Medicare', lead_source='Community Event', appointment_status='procedure_scheduled', last_contacted='2025-11-30', lifetime_value=4600 WHERE salesforce_id='003Dn00000A2015';
-- Premium Lens patients
UPDATE patients SET date_of_birth='1963-06-10', gender='Female', city='Beverly Hills', state='CA', insurance_provider='Cigna', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2025-12-08', lifetime_value=1500 WHERE salesforce_id='003Dn00000A3001';
UPDATE patients SET date_of_birth='1961-09-28', gender='Male', city='Los Angeles', state='CA', insurance_provider='Blue Cross', lead_source='Referral', appointment_status='follow_up_scheduled', last_contacted='2026-01-03', lifetime_value=6500 WHERE salesforce_id='003Dn00000A3002';
UPDATE patients SET date_of_birth='1964-03-15', gender='Female', city='San Francisco', state='CA', insurance_provider='Aetna', lead_source='Google Ads', appointment_status='consultation_done', last_contacted='2025-11-28', lifetime_value=2200 WHERE salesforce_id='003Dn00000A3003';
UPDATE patients SET date_of_birth='1962-07-02', gender='Male', city='Newport Beach', state='CA', insurance_provider='United Health', lead_source='Walk-in', appointment_status='procedure_scheduled', last_contacted='2025-12-18', lifetime_value=8500 WHERE salesforce_id='003Dn00000A3004';
UPDATE patients SET date_of_birth='1965-11-22', gender='Female', city='San Diego', state='CA', insurance_provider='Blue Shield', lead_source='Instagram', appointment_status='consultation_done', last_contacted='2026-01-12', lifetime_value=3200 WHERE salesforce_id='003Dn00000A3005';
UPDATE patients SET date_of_birth='1960-02-14', gender='Male', city='Irvine', state='CA', insurance_provider='Medicare + Supplement', lead_source='Doctor Referral', appointment_status='follow_up_scheduled', last_contacted='2025-11-15', lifetime_value=5800 WHERE salesforce_id='003Dn00000A3006';
UPDATE patients SET date_of_birth='1963-08-30', gender='Female', city='Pasadena', state='CA', insurance_provider='Kaiser', lead_source='Yelp', appointment_status='consultation_done', last_contacted='2025-12-22', lifetime_value=2800 WHERE salesforce_id='003Dn00000A3007';
UPDATE patients SET date_of_birth='1961-12-05', gender='Male', city='Long Beach', state='CA', insurance_provider='Blue Cross', lead_source='Referral', appointment_status='waiting_authorization', last_contacted='2026-01-08', lifetime_value=7200 WHERE salesforce_id='003Dn00000A3008';
UPDATE patients SET date_of_birth='1962-04-18', gender='Female', city='Glendale', state='CA', insurance_provider='Aetna', lead_source='Community Event', appointment_status='consultation_done', last_contacted='2025-11-25', lifetime_value=3500 WHERE salesforce_id='003Dn00000A3009';
UPDATE patients SET date_of_birth='1959-06-22', gender='Male', city='Santa Barbara', state='CA', insurance_provider='United Health', lead_source='Google Ads', appointment_status='follow_up_scheduled', last_contacted='2026-01-15', lifetime_value=4800 WHERE salesforce_id='003Dn00000A3010';
UPDATE patients SET date_of_birth='1964-10-12', gender='Female', city='Los Angeles', state='CA', insurance_provider='Cigna', lead_source='LinkedIn', appointment_status='procedure_scheduled', last_contacted='2025-12-30', lifetime_value=9500 WHERE salesforce_id='003Dn00000A3011';
UPDATE patients SET date_of_birth='1958-03-08', gender='Male', city='Anaheim', state='CA', insurance_provider='Medicare', lead_source='Walk-in', appointment_status='consultation_done', last_contacted='2025-11-08', lifetime_value=6100 WHERE salesforce_id='003Dn00000A3012';
UPDATE patients SET date_of_birth='1965-07-25', gender='Female', city='San Jose', state='CA', insurance_provider='Blue Shield', lead_source='Referral', appointment_status='consultation_done', last_contacted='2026-01-18', lifetime_value=4200 WHERE salesforce_id='003Dn00000A3013';
UPDATE patients SET date_of_birth='1961-11-30', gender='Male', city='Sacramento', state='CA', insurance_provider='Aetna', lead_source='Google Ads', appointment_status='follow_up_scheduled', last_contacted='2025-12-12', lifetime_value=5500 WHERE salesforce_id='003Dn00000A3014';
UPDATE patients SET date_of_birth='1960-05-16', gender='Female', city='Torrance', state='CA', insurance_provider='United Health', lead_source='Facebook', appointment_status='consultation_done', last_contacted='2025-11-20', lifetime_value=3800 WHERE salesforce_id='003Dn00000A3015';

-- ===========================================================================
-- CAMPAIGN TEMPLATES (3 templates with blended cadence)
-- ===========================================================================
INSERT INTO campaign_templates (name, type, target_procedure, base_prompt, email_subject_template, cadence_config) VALUES
('Year-End LASIK Promo', 'promotional', 'LASIK', 
 'Generate a promotional message for {first_name} {last_name} who is interested in LASIK. Personalize based on their consultation notes: {consultation_notes}. Mention year-end special pricing. Address their specific concern about {primary_concern}. Include clear call-to-action to schedule consultation.',
 'Clear Vision for {year} — Year-End LASIK Special',
 '[{"day": 1, "channel": "email"}, {"day": 3, "channel": "sms"}, {"day": 5, "channel": "email"}, {"day": 7, "channel": "sms"}]'::jsonb),

('Cataract Education Series', 'educational', 'Cataract', 
 'Generate educational content for {first_name} {last_name} about cataract treatment (part {part} of series). Address their specific concern from consultation: {consultation_notes}. Provide factual, reassuring information about the procedure, recovery, and outcomes. Tone should be informative and empathetic.',
 'Understanding Your Cataract Treatment Options — Part {part}',
 '[{"day": 1, "channel": "email"}, {"day": 3, "channel": "email"}, {"day": 5, "channel": "sms"}, {"day": 7, "channel": "email"}, {"day": 10, "channel": "sms"}, {"day": 14, "channel": "email"}]'::jsonb),

('Premium Lens Options Drip', 'nurture', 'Premium Lens', 
 'Generate nurture content for {first_name} {last_name} about premium intraocular lens options. Reference their consultation notes: {consultation_notes}. Explain benefits of premium lenses for their specific vision needs and lifestyle. Tone should be informative and empowering, not pushy.',
 'Premium Lens Technology — Discover Your Options',
 '[{"day": 1, "channel": "email"}, {"day": 4, "channel": "sms"}, {"day": 10, "channel": "email"}]'::jsonb);

-- ===========================================================================
-- CAMPAIGNS (2 pre-generated campaigns)
-- ===========================================================================
INSERT INTO campaigns (template_id, name, status, date_range_start, date_range_end, prompt_text, parsed_prompt_params) VALUES
(1, 'Summer LASIK Promo 2026', 'active', '2026-04-01', '2026-08-31', 
 'Run a year-end LASIK promo for consultation patients between April 1 and August 31st targeting active lifestyle patients',
 '{"target_audience": "active lifestyle", "procedure": "LASIK", "offer_type": "seasonal promotion"}'::jsonb),

(2, 'Cataract Education Q2', 'in_review', '2026-04-15', '2026-06-30',
 'Educational cataract series for seniors who had consultations in last 6 months, focus on safety and recovery',
 '{"target_audience": "seniors", "procedure": "Cataract", "focus": "safety and recovery", "timeframe": "Q2 2026"}'::jsonb);

-- ===========================================================================
-- CAMPAIGN CONTENT VARIANTS (Sample tone variants for key patients)
-- ===========================================================================
-- Note: Using dollar-quoted strings ($$) to avoid escaping issues with quotes

-- Campaign 1 (Summer LASIK) - Sarah Mitchell variants (Email)
INSERT INTO campaign_content_variants (campaign_id, patient_id, message_type, tone_label, subject_line, content, is_selected) VALUES
(1, 1, 'email', 'Medical/Professional', 'LASIK Consultation Follow-Up', $$Dear Sarah,
Following your recent consultation, I wanted to provide clinical information regarding LASIK surgery and your visual needs. Your concerns about night driving glare and the ski trip are important considerations. Post-operative night driving capability typically returns within 1-2 weeks. I recommend scheduling your procedure at least 4 weeks before your ski trip. Please contact our office.
Sincerely, Dr. Vision Team$$, false),

(1, 1, 'email', 'Informative', 'Your LASIK Questions Answered', $$Hi Sarah,
Thanks for your consultation! Modern LASIK technology significantly reduces night glare. Most patients drive at night within 1-2 weeks. Tennis and skiing are cleared after 2-3 weeks with protective eyewear. For your ski trip, schedule at least 4 weeks prior. Ready to move forward?
Best, nVision LASIK Team$$, true),

(1, 1, 'email', 'Friendly', 'Get Ready for Ski Season', $$Hey Sarah! The technology we use is designed to preserve night vision. With your tennis schedule and skiing plans, you will love the freedom of clear vision. Schedule 4-6 weeks before your trip for complete healing. Want to grab a time slot?
Looking forward to helping you see clearly! The nVision Team$$, false),

(1, 1, 'email', 'Casual', 'Night Driving After LASIK', $$Sarah - Quick follow-up. Our LASIK tech handles night vision well. Most people drive at night within 1-2 weeks. For your ski trip, plan at least a month out. Tennis 3x a week is awesome - no more glasses during games.
Let me know if you want to schedule. - nVision$$, false),

(1, 1, 'email', 'Empathetic', 'I Understand Your Concerns', $$Dear Sarah,
I appreciated our conversation. Night driving safety and ski trip timing are completely valid concerns. Your safety and confidence are our priorities. Modern LASIK has come far in addressing night vision. We work with patients every day who want to make the right choice. We can create a timeline that feels right for YOU.
Can we schedule a follow-up call? With care, Dr. Vision Team$$, false),

-- Campaign 1 - David Thompson variants (Email)
(1, 2, 'email', 'Medical/Professional', 'LASIK for Athletes', $$Dear David,
Following your consultation, I am addressing your concerns as an active basketball player and software developer. Post-operative protective eyewear protocols: Days 1-7 no contact sports, Weeks 2-4 protective goggles required, Week 4+ cleared for full activity. I recommend preservative-free tears for screen work during recovery.
Please contact our surgical coordinator. Regards, Clinical Team$$, false),

(1, 2, 'email', 'Informative', 'Getting Back to Basketball', $$Hi David,
Great meeting you! Basketball timeline: Week 1 no basketball, Week 2-3 light practice with goggles, Week 4 full games cleared. Screen work resumes after 24-48 hours. We will do a dry eye assessment before surgery to ensure success.
Ready to schedule? Best, nVision Team$$, true),

(1, 2, 'email', 'Friendly', 'No More Foggy Glasses', $$David! After LASIK you will wake up game-ready. No glasses, no fog. Recovery is straightforward - protective goggles for a few weeks, cleared by week 4. We will check your dry eyes beforehand. Back to screens in 48 hours. Want to set up your procedure?
- nVision$$, false),

(1, 2, 'email', 'Casual', 'LASIK Timeline', $$David - Basketball: Week 1 sit out, Week 2-3 practice with goggles, Week 4+ full games. Screen work in 2 days. Dry eyes managed with drops. Solid candidate. Let me know.
- nVision$$, false),

(1, 2, 'email', 'Empathetic', 'Build Your LASIK Plan', $$Hi David,
Thank you for your openness about dry eye worries, basketball recovery, and development work impact. I want you to feel 100% confident. We will do thorough dry eye assessment, create a custom timeline for basketball, and plan post-op care for developers. Your lifestyle matters to us.
Can we schedule a detailed planning session? Take care, Dr. Vision Team$$, false),

-- Campaign 2 (Cataract Education) - Robert Chen variants (Email and SMS)
(2, 21, 'email', 'Medical/Professional', 'Cataract Surgery Recovery', $$Dear Mr. Chen,
Post-operative recovery timeline: Day 1 vision improvement begins, Week 1 avoid heavy lifting, Week 2-4 gradual return to activities, Week 4+ full recovery. Most patients resume driving within 24-48 hours. Schedule surgery 2-3 weeks before your grandchild visit for optimal visual clarity.
Please contact our surgical coordinator. Regards, Surgical Department$$, false),

(2, 21, 'email', 'Informative', 'Recovery Week by Week', $$Hi Robert,
Week 1 after surgery: improvement right away, mild scratchiness normal, most drive within 48 hours. Week 2-4: vision improves and stabilizes, resume normal activities, avoid swimming. By your grandchild visit you will see clearly. Schedule 3 weeks before. Your wife concerns about night driving are valid - we ensure clearance first.
Ready to schedule? Best, nVision Team$$, true),

(2, 21, 'sms', 'Informative', '', $$Hi Robert, nVision here. Most cataract patients drive within 2 days, fully recover in 2-4 weeks. For grandchild visit, schedule surgery 3 weeks prior. Questions? Reply or call.$$, true),

(2, 21, 'sms', 'Friendly', '', $$Robert! Recovery quicker than you think - drive in 2 days, healed in a month. Schedule 3 weeks before grandchild visits and see every detail clearly! Text back. -nVision$$, false),

(2, 21, 'sms', 'Casual', '', $$Robert - Recovery: drive in 2 days, normal in 2 weeks, healed in month. Schedule 3 weeks before visit. Questions? Text. -nVision$$, false),

-- Additional SMS variants for David Thompson (Campaign 1)
(1, 2, 'sms', 'Informative', '', $$Hi David, nVision here! LASIK recovery for basketball: Week 1 rest, Weeks 2-3 practice with goggles, Week 4+ full games. Screen work in 48hrs. Ready to schedule?$$, true),

(1, 2, 'sms', 'Friendly', '', $$David! No more foggy glasses during hoops after LASIK. Recovery: 1 week rest, then back with goggles. Game-ready by week 4. -nVision$$, false),

(1, 2, 'sms', 'Casual', '', $$David - LASIK timeline: 1 week off basketball, 2-3 weeks with goggles, then full games. Back to screens in 2 days. Text to schedule. -nVision$$, false);

-- ===========================================================================
-- CAMPAIGN RECIPIENTS (12 for Campaign 1, 8 for Campaign 2)
-- ===========================================================================

-- Campaign 1 Recipients (Summer LASIK - 12 LASIK patients)
INSERT INTO campaign_recipients (campaign_id, patient_id, selected_email_variant_id, cadence_step, channel, scheduled_time, status) VALUES
(1, 1, 2, 1, 'email', '2026-04-01 09:00:00', 'sent'),  -- Sarah Mitchell
(1, 2, 7, 1, 'email', '2026-04-01 09:05:00', 'sent'),  -- David Thompson
(1, 3, NULL, 1, 'email', '2026-04-01 09:10:00', 'sent'),  -- Jennifer Rodriguez
(1, 4, NULL, 1, 'email', '2026-04-01 09:15:00', 'sent'),  -- Michael Anderson
(1, 5, NULL, 1, 'email', '2026-04-01 09:20:00', 'sent'),  -- Emily Williams
(1, 7, NULL, 1, 'email', '2026-04-01 09:25:00', 'sent'),  -- Ashley Martinez
(1, 8, NULL, 1, 'email', '2026-04-01 09:30:00', 'sent'),  -- Christopher Brown
(1, 10, NULL, 1, 'email', '2026-04-01 09:35:00', 'sent'),  -- Daniel Wilson
(1, 12, NULL, 1, 'email', '2026-04-01 09:40:00', 'sent'),  -- Ryan Moore
(1, 15, NULL, 1, 'email', '2026-04-01 09:45:00', 'sent'),  -- Stephanie White
(1, 18, NULL, 1, 'email', '2026-04-01 09:50:00', 'sent'),  -- Justin Lewis
(1, 19, NULL, 1, 'email', '2026-04-01 09:55:00', 'sent');  -- Nicole Walker

-- Campaign 2 Recipients (Cataract Education - 8 cataract patients)
INSERT INTO campaign_recipients (campaign_id, patient_id, selected_email_variant_id, cadence_step, channel, scheduled_time, status) VALUES
(2, 21, 17, 1, 'email', '2026-04-15 10:00:00', 'pending'),  -- Robert Chen
(2, 22, NULL, 1, 'email', '2026-04-15 10:05:00', 'pending'),  -- Margaret Patterson
(2, 23, NULL, 1, 'email', '2026-04-15 10:10:00', 'pending'),  -- William Foster
(2, 25, NULL, 1, 'email', '2026-04-15 10:15:00', 'pending'),  -- Richard Bennett
(2, 27, NULL, 1, 'email', '2026-04-15 10:20:00', 'pending'),  -- Joseph Coleman
(2, 30, NULL, 1, 'email', '2026-04-15 10:25:00', 'pending'),  -- Helen Morgan
(2, 31, NULL, 1, 'email', '2026-04-15 10:30:00', 'pending'),  -- Charles Powell
(2, 35, NULL, 1, 'email', '2026-04-15 10:35:00', 'pending');  -- George Simmons

-- ===========================================================================
-- DELIVERY LOG (30-40 entries for Campaign 1)
-- ===========================================================================
INSERT INTO delivery_log (campaign_recipient_id, channel, sent_at, tracking_id, status) VALUES
-- Day 1 sends (all 12 emails)
(1, 'email', '2026-04-01 09:00:15', 'TRK-E-001-001', 'opened'),
(2, 'email', '2026-04-01 09:05:12', 'TRK-E-001-002', 'opened'),
(3, 'email', '2026-04-01 09:10:08', 'TRK-E-001-003', 'delivered'),
(4, 'email', '2026-04-01 09:15:22', 'TRK-E-001-004', 'clicked'),
(5, 'email', '2026-04-01 09:20:18', 'TRK-E-001-005', 'delivered'),
(6, 'email', '2026-04-01 09:25:33', 'TRK-E-001-006', 'opened'),
(7, 'email', '2026-04-01 09:30:41', 'TRK-E-001-007', 'clicked'),
(8, 'email', '2026-04-01 09:35:27', 'TRK-E-001-008', 'opened'),
(9, 'email', '2026-04-01 09:40:19', 'TRK-E-001-009', 'delivered'),
(10, 'email', '2026-04-01 09:45:55', 'TRK-E-001-010', 'delivered'),
(11, 'email', '2026-04-01 09:50:31', 'TRK-E-001-011', 'clicked'),
(12, 'email', '2026-04-01 09:55:44', 'TRK-E-001-012', 'opened'),

-- Day 2 status updates (additional opens/clicks)
(1, 'email', '2026-04-02 14:22:00', 'TRK-E-001-001', 'clicked'),
(3, 'email', '2026-04-02 11:15:00', 'TRK-E-001-003', 'opened'),
(5, 'email', '2026-04-02 16:45:00', 'TRK-E-001-005', 'opened'),
(9, 'email', '2026-04-02 10:30:00', 'TRK-E-001-009', 'opened'),

-- Day 3 SMS sends (cadence step 2)
(1, 'sms', '2026-04-03 10:00:00', 'TRK-S-003-001', 'delivered'),
(2, 'sms', '2026-04-03 10:01:00', 'TRK-S-003-002', 'delivered'),
(4, 'sms', '2026-04-03 10:02:00', 'TRK-S-003-004', 'delivered'),
(6, 'sms', '2026-04-03 10:03:00', 'TRK-S-003-006', 'delivered'),
(7, 'sms', '2026-04-03 10:04:00', 'TRK-S-003-007', 'delivered'),
(8, 'sms', '2026-04-03 10:05:00', 'TRK-S-003-008', 'delivered'),
(11, 'sms', '2026-04-03 10:06:00', 'TRK-S-003-011', 'delivered'),
(12, 'sms', '2026-04-03 10:07:00', 'TRK-S-003-012', 'delivered'),

-- Day 4 additional opens
(6, 'email', '2026-04-04 09:20:00', 'TRK-E-001-006', 'clicked'),
(10, 'email', '2026-04-04 13:15:00', 'TRK-E-001-010', 'opened'),
(12, 'email', '2026-04-04 15:45:00', 'TRK-E-001-012', 'clicked');

-- ===========================================================================
-- ANALYTICS METRICS (3 days for Campaign 1)
-- ===========================================================================
INSERT INTO analytics_metrics (campaign_id, metric_date, emails_sent, emails_opened, emails_clicked, sms_sent, sms_replied, conversions) VALUES
(1, '2026-04-01', 12, 5, 2, 0, 0, 0),
(1, '2026-04-02', 0, 7, 3, 0, 0, 0),
(1, '2026-04-03', 0, 7, 3, 8, 0, 0),
(1, '2026-04-04', 0, 9, 5, 8, 0, 1);

-- ===========================================================================
-- AGENT ACTIVITY LOG (Campaign 1 generation process)
-- ===========================================================================
INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at) VALUES
(1, 'Data Analyst', 'Extracting patient cohort from Salesforce: LASIK interest, engagement >65, consultation within 6 months', 'completed', '2026-03-28 14:00:00'),
(1, 'Data Analyst', 'Found 24 matching patients, filtered to top 12 by engagement score and activity recency', 'completed', '2026-03-28 14:02:15'),
(1, 'Copywriter', 'Analyzing patient consultation notes for personalization keywords', 'completed', '2026-03-28 14:05:00'),
(1, 'Copywriter', 'Generating 5 tone variants per patient (Medical, Informative, Friendly, Casual, Empathetic)', 'completed', '2026-03-28 14:15:30'),
(1, 'Copywriter', 'Generated 60 email variants and 40 SMS variants (12 patients x multi-channel)', 'completed', '2026-03-28 14:25:45'),
(1, 'Campaign Manager', 'Building multi-channel cadence schedule: Email Day 1, SMS Day 3, Email Day 5, SMS Day 7', 'completed', '2026-03-28 14:30:00'),
(1, 'Campaign Manager', 'Campaign status set to IN_REVIEW, awaiting human approval', 'completed', '2026-03-28 14:32:00'),
(1, 'Campaign Manager', 'Campaign approved and activated. Scheduling delivery queue.', 'completed', '2026-03-31 16:45:00'),
(1, 'Campaign Manager', 'Day 1 email batch delivered successfully (12/12 sent)', 'completed', '2026-04-01 10:00:00'),
(1, 'Campaign Manager', 'Day 3 SMS batch delivered successfully (8/12 sent, 4 opted for email-only)', 'completed', '2026-04-03 10:10:00');

INSERT INTO agent_activity_log (campaign_id, agent_name, activity_message, status, created_at) VALUES
(2, 'Data Analyst', 'Extracting cataract patient cohort: age 60+, consultation within 6 months, email preferred', 'completed', '2026-04-10 11:00:00'),
(2, 'Data Analyst', 'Found 15 matching patients, selected 8 with highest engagement and recovery concerns', 'completed', '2026-04-10 11:03:00'),
(2, 'Copywriter', 'Generating educational content series (6-part cadence) with empathetic, informative tone', 'completed', '2026-04-10 11:10:00'),
(2, 'Copywriter', 'Personalized content based on specific recovery concerns (driving, grandchildren, hobbies)', 'completed', '2026-04-10 11:20:00'),
(2, 'Campaign Manager', 'Building blended email/SMS cadence: Days 1, 3, 5(SMS), 7, 10(SMS), 14', 'completed', '2026-04-10 11:25:00'),
(2, 'Campaign Manager', 'Campaign status: IN_REVIEW. Pending approval before activation.', 'completed', '2026-04-10 11:30:00');

-- ===========================================================================
-- SUCCESS MESSAGE
-- ===========================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'nVision Demo Database Seeded Successfully!';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Data Summary:';
  RAISE NOTICE '  - 50 Patients (20 LASIK, 15 Cataract, 15 Premium Lens)';
  RAISE NOTICE '  - 3 Campaign Templates (Promotional, Educational, Nurture)';
  RAISE NOTICE '  - 2 Campaigns (1 Active, 1 In Review)';
  RAISE NOTICE '  - 25 Content Variants (5 tones x 4 key patients + SMS)';
  RAISE NOTICE '  - 20 Campaign Recipients (12 active, 8 pending)';
  RAISE NOTICE '  - 30 Delivery Log Entries (emails + SMS)';
  RAISE NOTICE '  - 4 Days of Analytics Metrics';
  RAISE NOTICE '  - 16 Agent Activity Log Entries';
  RAISE NOTICE '=================================================================';
  RAISE NOTICE 'Key Demo Patients:';
  RAISE NOTICE '  - Sarah Mitchell (LASIK, ID 1): night driving concerns, ski trip';
  RAISE NOTICE '  - David Thompson (LASIK, ID 2): basketball player, screen work';
  RAISE NOTICE '  - Robert Chen (Cataract, ID 11): recovery time, grandchild visit';
  RAISE NOTICE '  - Maria Garcia (Premium Lens, ID 21): reading glasses frustration';
  RAISE NOTICE '=================================================================';
END $$;
