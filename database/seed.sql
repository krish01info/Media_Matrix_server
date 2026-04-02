-- ============================================================
-- Media Matrix — Seed Data for Testing
-- ============================================================

USE media_matrix;

-- ============================================================
-- Categories
-- ============================================================
INSERT INTO categories (name, slug, description, gradient_start, gradient_end, display_order) VALUES
('Global Affairs', 'global-affairs', 'Geopolitics, diplomacy, global conflicts, and international relations.', '#1a237e', '#0d47a1', 1),
('Tech & Innovation', 'tech-innovation', 'Latest in technology, AI, startups, and digital innovation.', '#004d40', '#00695c', 2),
('Politics & Policy', 'politics-policy', 'Government policy, elections, legislation, and political analysis.', '#b71c1c', '#c62828', 3),
('Science & Research', 'science-research', 'Scientific discoveries, research breakthroughs, and space exploration.', '#4a148c', '#6a1b9a', 4),
('Economy', 'economy', 'Markets, finance, trade, and economic analysis.', '#e65100', '#f57c00', 5),
('Space', 'space', 'Space exploration, NASA missions, and astronomical discoveries.', '#1b5e20', '#2e7d32', 6),
('Health', 'health', 'Medical breakthroughs, public health, and wellness.', '#880e4f', '#ad1457', 7),
('Environment', 'environment', 'Climate change, sustainability, and environmental policy.', '#1a237e', '#283593', 8);

-- ============================================================
-- Sources
-- ============================================================
INSERT INTO sources (name, short_name, slug, logo_url, website_url, is_verified, trust_score, has_radio, has_newspaper) VALUES
('The New York Times', 'NYT', 'nyt', 'https://res.cloudinary.com/demo/image/upload/nyt_logo.png', 'https://www.nytimes.com', 1, 92.50, 1, 1),
('Wall Street Journal', 'WSJ', 'wsj', 'https://res.cloudinary.com/demo/image/upload/wsj_logo.png', 'https://www.wsj.com', 1, 91.00, 0, 1),
('BBC World', 'BBC', 'bbc-world', 'https://res.cloudinary.com/demo/image/upload/bbc_logo.png', 'https://www.bbc.com', 1, 94.00, 1, 0),
('Reuters', 'Reuters', 'reuters', 'https://res.cloudinary.com/demo/image/upload/reuters_logo.png', 'https://www.reuters.com', 1, 95.50, 1, 0),
('Al Jazeera', 'AJ', 'al-jazeera', 'https://res.cloudinary.com/demo/image/upload/aj_logo.png', 'https://www.aljazeera.com', 1, 85.00, 1, 0),
('Financial Times', 'FT', 'financial-times', 'https://res.cloudinary.com/demo/image/upload/ft_logo.png', 'https://www.ft.com', 1, 93.00, 1, 1),
('Associated Press', 'AP', 'associated-press', 'https://res.cloudinary.com/demo/image/upload/ap_logo.png', 'https://apnews.com', 1, 96.00, 0, 0),
('Bloomberg', 'Bloomberg', 'bloomberg', 'https://res.cloudinary.com/demo/image/upload/bloomberg_logo.png', 'https://www.bloomberg.com', 1, 90.00, 0, 0);

-- ============================================================
-- Reporters
-- ============================================================
INSERT INTO reporters (name, slug, title, bio, truth_score, is_verified, is_independent, source_id) VALUES
('Elena Richardson', 'elena-richardson', 'Conflict Zone Specialist', 'Award-winning journalist covering global conflicts and humanitarian crises with over 15 years of field experience.', 91.00, 1, 1, NULL),
('Marcus Thorne', 'marcus-thorne', 'Deep Tech Analyst', 'Former Silicon Valley engineer turned technology journalist. Specializes in AI, quantum computing, and emerging tech.', 88.50, 1, 1, NULL),
('Sarah Chen', 'sarah-chen', 'Asia-Pacific Correspondent', 'Based in Singapore, covering economic and political developments across the Asia-Pacific region.', 89.00, 1, 0, 4),
('James Okafor', 'james-okafor', 'Africa Bureau Chief', 'Veteran journalist reporting on African politics, economics, and social issues for over two decades.', 87.50, 1, 1, NULL),
('Maria Santos', 'maria-santos', 'Latin America Editor', 'Pulitzer Prize nominee covering Latin American affairs, trade, and democratic movements.', 93.00, 1, 0, 7),
('David Park', 'david-park', 'Climate & Energy Reporter', 'Environmental journalist and author. Covers climate policy, renewable energy, and sustainability.', 90.00, 1, 1, NULL);

-- ============================================================
-- Regions
-- ============================================================
INSERT INTO regions (name, slug, parent_id, latitude, longitude) VALUES
('Americas', 'americas', NULL, 19.4326, -99.1332),
('Europe', 'europe', NULL, 50.8503, 4.3517),
('Asia', 'asia', NULL, 35.6762, 139.6503),
('Middle East', 'middle-east', NULL, 25.2048, 55.2708),
('Africa', 'africa', NULL, -1.2921, 36.8219),
('Oceania', 'oceania', NULL, -33.8688, 151.2093),
('North America', 'north-america', 1, 38.9072, -77.0369),
('South America', 'south-america', 1, -23.5505, -46.6333),
('Western Europe', 'western-europe', 2, 48.8566, 2.3522),
('Eastern Europe', 'eastern-europe', 2, 52.2297, 21.0122),
('East Asia', 'east-asia', 3, 35.6762, 139.6503),
('South Asia', 'south-asia', 3, 28.6139, 77.2090),
('Southeast Asia', 'southeast-asia', 3, 1.3521, 103.8198);

-- ============================================================
-- Tags
-- ============================================================
INSERT INTO tags (name, slug) VALUES
('Climate Accord 2.0', 'climate-accord-2'),
('Semiconductor Rivalry', 'semiconductor-rivalry'),
('AI Regulation', 'ai-regulation'),
('Trade Wars', 'trade-wars'),
('Space Exploration', 'space-exploration'),
('Digital Currency', 'digital-currency'),
('Vaccine Trials', 'vaccine-trials'),
('Arctic Policy', 'arctic-policy'),
('Nuclear Fusion', 'nuclear-fusion'),
('Carbon Neutrality', 'carbon-neutrality'),
('Election 2024', 'election-2024'),
('Market Volatility', 'market-volatility');

-- ============================================================
-- Articles
-- ============================================================
INSERT INTO articles (uuid, title, subtitle, slug, content, summary, image_url, thumbnail_url, category_id, source_id, reporter_id, truth_score, is_verified, is_featured, is_breaking, is_developing, is_live, is_morning_brief, interaction_count, view_count, share_count, published_at) VALUES

-- Featured / Home
('a1b2c3d4-e5f6-7890-abcd-111111111111', 'Global Economy Shifts', 'Major economic indicators point to significant restructuring', 'global-economy-shifts', 'The global economy is undergoing a fundamental transformation as emerging markets gain momentum while traditional economic powers face new challenges. Central banks worldwide are adjusting monetary policies in response to shifting trade patterns and technological disruption. Analysts predict that the next decade will see a significant rebalancing of economic power, with Asia-Pacific economies playing an increasingly central role. The International Monetary Fund has revised its growth forecasts upward for developing nations while maintaining cautious outlooks for established economies.', 'Major economic indicators point to significant global restructuring as emerging markets gain momentum.', 'https://res.cloudinary.com/demo/image/upload/economy_shift.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/economy_shift.jpg', 5, 1, NULL, 94.00, 1, 1, 0, 0, 0, 0, 2400000, 5200000, 180000, NOW() - INTERVAL 2 HOUR),

('a1b2c3d4-e5f6-7890-abcd-222222222222', 'AI Revolution 2024', 'Artificial intelligence reaches new milestones in every industry', 'ai-revolution-2024', 'Artificial intelligence has reached unprecedented capabilities in 2024, with new models demonstrating reasoning abilities that were previously thought to be decades away. Major tech companies have deployed AI systems that can write code, diagnose medical conditions, and create realistic visual content. The revolution extends beyond consumer applications into manufacturing, agriculture, and scientific research. Governments worldwide are scrambling to create regulatory frameworks that balance innovation with safety concerns. Industry leaders emphasize the need for responsible AI development while pushing the boundaries of what machines can accomplish.', 'AI reaches new milestones across industries with unprecedented reasoning capabilities.', 'https://res.cloudinary.com/demo/image/upload/ai_revolution.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/ai_revolution.jpg', 2, 3, 2, 89.00, 1, 1, 0, 0, 0, 0, 1800000, 4100000, 220000, NOW() - INTERVAL 3 HOUR),

-- Trending Now
('a1b2c3d4-e5f6-7890-abcd-333333333333', 'Central Bank announces unexpected interest rate changes', 'Markets react as Federal Reserve shifts monetary policy direction', 'central-bank-interest-rate-changes', 'In a surprise move that sent ripples through global financial markets, the Central Bank announced significant changes to its interest rate policy. The decision, which defied analyst expectations, reflects growing concerns about inflation persistence and economic overheating in key sectors. Bond markets immediately repriced expectations for future rate paths, while equity markets showed mixed reactions. Financial analysts are now reassessing their economic models and investment strategies in light of this policy shift. The implications extend beyond domestic markets, affecting currency valuations and international capital flows.', 'Federal Reserve makes surprise interest rate announcement, markets react globally.', 'https://res.cloudinary.com/demo/image/upload/central_bank.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/central_bank.jpg', 5, 6, NULL, 94.00, 1, 0, 0, 0, 0, 1, 1200000, 3200000, 95000, NOW() - INTERVAL 1 HOUR),

('a1b2c3d4-e5f6-7890-abcd-444444444444', 'New quantum computing breakthrough', 'Scientists achieve quantum supremacy in practical application', 'quantum-computing-breakthrough', 'A team of international researchers has achieved a landmark breakthrough in quantum computing, demonstrating practical quantum advantage in solving real-world optimization problems. The experiment, conducted using a 1,000-qubit processor, solved complex logistics challenges in minutes that would take classical supercomputers thousands of years. This marks a pivotal moment in the quest for practical quantum computing, moving the technology from theoretical demonstrations to tangible business applications. Industry leaders predict this breakthrough could revolutionize drug discovery, financial modeling, and climate simulation within the decade.', 'Researchers achieve practical quantum advantage using 1,000-qubit processor.', 'https://res.cloudinary.com/demo/image/upload/quantum_computing.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/quantum_computing.jpg', 2, 4, 2, 87.50, 1, 0, 0, 0, 0, 0, 980000, 2800000, 156000, NOW() - INTERVAL 4 HOUR),

-- Morning Brief
('a1b2c3d4-e5f6-7890-abcd-555555555555', 'Global Markets hit all-time high as inflation costs significantly', 'Record-breaking rally across major stock exchanges', 'global-markets-all-time-high', 'Global stock markets surged to record highs today as inflation data showed a significant and sustained decline across major economies. The S&P 500, FTSE 100, and Nikkei 225 all posted strong gains, driven by renewed optimism about the economic outlook. Consumer prices fell for the third consecutive month, raising expectations that central banks may begin cutting interest rates sooner than expected. Technology stocks led the rally, with major AI companies posting double-digit percentage gains. Market analysts caution that while the trend is positive, geopolitical uncertainties and supply chain disruptions could still derail the recovery.', 'Stock markets worldwide reach record highs as inflation shows sustained decline.', 'https://res.cloudinary.com/demo/image/upload/global_markets.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/global_markets.jpg', 5, 8, NULL, 92.00, 1, 0, 0, 0, 0, 1, 890000, 2100000, 67000, NOW() - INTERVAL 5 HOUR),

('a1b2c3d4-e5f6-7890-abcd-666666666666', 'New Neural Engine architecture doubles processing efficiency', 'Breakthrough chip design achieves 2x performance per watt', 'neural-engine-architecture', 'A revolutionary neural processing architecture unveiled today promises to double the computational efficiency of AI workloads while halving energy consumption. The new chip design, developed through a collaboration between leading semiconductor companies, uses a novel approach to parallel processing that mimics biological neural networks more closely than existing architectures. Early benchmarks show remarkable improvements across natural language processing, computer vision, and autonomous systems. The technology is expected to accelerate the deployment of edge AI devices, enabling sophisticated AI capabilities in smartphones, IoT devices, and autonomous vehicles without relying on cloud computing resources.', 'Revolutionary chip architecture doubles AI processing efficiency while halving energy use.', 'https://res.cloudinary.com/demo/image/upload/neural_engine.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/neural_engine.jpg', 2, 7, 2, 88.00, 1, 0, 0, 0, 0, 1, 750000, 1900000, 89000, NOW() - INTERVAL 6 HOUR),

('a1b2c3d4-e5f6-7890-abcd-777777777777', 'Mars Rover discovers organic compounds in ancient lake bed', 'NASA confirms presence of complex organic molecules on Mars', 'mars-rover-organic-compounds', 'NASA''s Perseverance rover has made its most significant discovery yet, identifying complex organic compounds in sedimentary rocks within an ancient Martian lake bed. The finding, announced at a press conference today, represents the strongest evidence to date for the potential of past microbial life on Mars. The organic molecules were found preserved within mineral formations that scientists believe formed in liquid water billions of years ago. While the discovery does not confirm the existence of past life, it significantly narrows the range of conditions that could have produced these compounds. The samples are being sealed for future return to Earth as part of the Mars Sample Return mission.', 'Perseverance rover identifies complex organic molecules in ancient Martian lake sediments.', 'https://res.cloudinary.com/demo/image/upload/mars_rover.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/mars_rover.jpg', 6, 7, NULL, 96.00, 1, 0, 0, 0, 0, 1, 1500000, 3800000, 210000, NOW() - INTERVAL 7 HOUR),

-- Developing Now
('a1b2c3d4-e5f6-7890-abcd-888888888888', 'Electoral Commission results pending', 'Counting continues in major districts with narrow margins reported', 'electoral-commission-results-pending', 'The Electoral Commission has reported that vote counting is continuing in major districts, with early exit polls suggesting a narrow margin for the incumbent party. Several key swing districts remain too close to call, and officials have cautioned against premature declarations of victory by any candidate. International observers have praised the orderly conduct of the election despite long queues at polling stations in urban areas. The commission expects to announce preliminary results within 48 hours, with final certified results following within two weeks. Political analysts note that regardless of the outcome, the close race reflects deep divisions on economic policy and social issues.', 'Vote counting continues in major districts with races too close to call.', 'https://res.cloudinary.com/demo/image/upload/election_results.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/election_results.jpg', 3, 4, 1, 91.00, 1, 0, 0, 1, 0, 0, 2100000, 5600000, 340000, NOW() - INTERVAL 30 MINUTE),

('a1b2c3d4-e5f6-7890-abcd-999999999999', 'G7 Summit Communiqué released', 'Leaders agree on new climate framework aiming for carbon neutrality', 'g7-summit-communique-released', 'Leaders of the G7 nations have issued a joint communiqué following their annual summit, outlining an ambitious new framework for achieving carbon neutrality by 2040. The agreement includes binding commitments to phase out coal power, accelerate renewable energy deployment, and establish a $100 billion annual climate finance fund for developing nations. The communiqué also addresses trade liberalization, artificial intelligence governance, and coordinated responses to global health threats. Critics argue the targets are still insufficient to prevent catastrophic climate change, while industry groups express concern about the pace of the proposed transition. Implementation details will be negotiated at follow-up ministerial meetings.', 'G7 leaders announce ambitious climate framework with binding commitments for carbon neutrality by 2040.', 'https://res.cloudinary.com/demo/image/upload/g7_summit.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/g7_summit.jpg', 1, 3, 6, 93.00, 1, 0, 0, 1, 0, 0, 1800000, 4200000, 190000, NOW() - INTERVAL 1 HOUR),

-- Today''s Trending
('a1b2c3d4-e5f6-7890-abcd-aaaaaaaaaaaa', 'Breakthrough in universal flu vaccine trials', 'Phase III clinical trials show 95% efficacy across all flu strains', 'universal-flu-vaccine-breakthrough', 'A groundbreaking universal flu vaccine has shown remarkable results in Phase III clinical trials, demonstrating 95% efficacy against all known influenza strains. The vaccine, developed using mRNA technology refined during the COVID-19 pandemic, targets conserved regions of the influenza virus that remain stable across mutations. If approved, this could eliminate the need for annual flu shots and provide lasting protection against both seasonal and pandemic influenza strains. The pharmaceutical company behind the vaccine has submitted data to regulatory agencies and expects expedited review given the global impact of influenza, which causes up to 650,000 deaths annually worldwide.', 'Universal flu vaccine shows 95% efficacy in Phase III trials using mRNA technology.', 'https://res.cloudinary.com/demo/image/upload/flu_vaccine.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/flu_vaccine.jpg', 7, 1, NULL, 90.00, 1, 0, 0, 0, 0, 0, 3200000, 7800000, 450000, NOW() - INTERVAL 8 HOUR),

-- Global Affairs
('a1b2c3d4-e5f6-7890-abcd-bbbbbbbbbbbb', 'Trump says NATO refusal to help on Iran is very foolish mistake', 'US President criticizes alliance partners over Middle East stance', 'nato-refusal-iran-foolish-mistake', 'In a strongly worded statement, the US President criticized NATO allies for what he described as a foolish refusal to support American policy objectives regarding Iran. The comments came during a press conference following bilateral meetings at the White House, where the President expressed frustration with what he sees as inadequate burden-sharing by European partners. NATO officials responded by reaffirming the alliance''s commitment to collective security while emphasizing the importance of diplomatic approaches to Middle Eastern affairs. The exchange highlights growing transatlantic tensions over foreign policy priorities and defense spending commitments, with several European leaders calling for an emergency consultation.', 'US President criticizes NATO allies over Iran policy disagreements.', 'https://res.cloudinary.com/demo/image/upload/nato_iran.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/nato_iran.jpg', 1, 4, 1, 86.00, 1, 1, 0, 0, 1, 0, 4500000, 9200000, 680000, NOW() - INTERVAL 45 MINUTE),

-- Regional Pulse
('a1b2c3d4-e5f6-7890-abcd-cccccccccccc', 'Latin American trade bloc proposes unified digital currency', 'Mercosur nations explore blockchain-based regional currency', 'latam-unified-digital-currency', 'The Mercosur trade bloc has unveiled an ambitious proposal for a unified digital currency that would facilitate cross-border trade and reduce dependency on the US dollar. The blockchain-based system, tentatively called SurCoin, would be backed by a basket of member nations'' currencies and commodities. Proponents argue it could reduce transaction costs by up to 60% and provide financial inclusion for millions of unbanked citizens across the region. The proposal has received mixed reactions from international financial institutions, with the IMF expressing cautious interest while warning about potential monetary policy complications. Technical feasibility studies are expected to begin next quarter.', 'Mercosur trade bloc proposes blockchain-based unified digital currency called SurCoin.', 'https://res.cloudinary.com/demo/image/upload/digital_currency.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/digital_currency.jpg', 5, 7, 5, 84.00, 1, 0, 0, 0, 0, 0, 670000, 1800000, 45000, NOW() - INTERVAL 10 HOUR),

('a1b2c3d4-e5f6-7890-abcd-dddddddddddd', 'Pentagon increases focus on Arctic surveillance capabilities', 'Department of Defense expands polar monitoring infrastructure', 'pentagon-arctic-surveillance', 'The Pentagon has announced a significant expansion of its Arctic surveillance capabilities, deploying new satellite systems, underwater sensors, and unmanned aerial vehicles to monitor activity in the rapidly changing polar region. The initiative responds to increased military activity by Russia and growing Chinese interest in Arctic shipping routes opened by melting sea ice. Defense officials describe the Arctic as the next frontier of strategic competition, citing the region''s vast untapped natural resources and its importance for submarine operations. The deployment includes construction of two new forward operating bases in Alaska and enhanced cooperation with Canadian and Nordic allied forces.', 'Pentagon deploys new surveillance systems and forward bases to monitor Arctic activity.', 'https://res.cloudinary.com/demo/image/upload/arctic_surveillance.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/arctic_surveillance.jpg', 3, 7, NULL, 88.00, 1, 0, 0, 0, 0, 0, 540000, 1400000, 32000, NOW() - INTERVAL 12 HOUR),

-- Radio Coverage
('a1b2c3d4-e5f6-7890-abcd-eeeeeeeeeeee', 'Global Energy Summit', 'World leaders gather in Zurich for the acceleration of green energy', 'global-energy-summit', 'World leaders and industry executives have gathered in Zurich for the Global Energy Summit, focused on accelerating the transition to green energy sources. The three-day event features discussions on renewable energy financing, nuclear power revival, and hydrogen economy development. Key announcements include a multi-billion dollar fund for developing nations'' clean energy infrastructure and new international standards for carbon trading markets. Environmental activists have organized parallel events to push for more aggressive timelines, while fossil fuel industry representatives lobby for gradual transition policies that protect jobs and economic stability.', 'World leaders gather in Zurich to accelerate green energy transition.', 'https://res.cloudinary.com/demo/image/upload/energy_summit.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/energy_summit.jpg', 8, 3, 6, 91.00, 1, 0, 0, 0, 0, 0, 420000, 1100000, 28000, NOW() - INTERVAL 1 DAY),

('a1b2c3d4-e5f6-7890-abcd-ffffffffffff', 'Market Volatility Report', 'Analyzing the impact of recent policy changes on global tech markets', 'market-volatility-report', 'Global technology markets experienced heightened volatility this week as investors digested the implications of new regulatory frameworks and trade policy changes. The NASDAQ composite swung between gains of 3% and losses of 2% within a single trading session, reflecting deep uncertainty about the sector''s growth trajectory. Semiconductor stocks were particularly affected by new export restrictions, while AI-focused companies saw divergent performances based on their exposure to international markets. Market strategists recommend caution and portfolio diversification, noting that volatility is likely to persist until regulatory clarity emerges in key markets.', 'Tech markets show heightened volatility amid regulatory and trade policy changes.', 'https://res.cloudinary.com/demo/image/upload/market_volatility.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/market_volatility.jpg', 5, 8, NULL, 89.00, 1, 0, 0, 0, 0, 0, 380000, 950000, 21000, NOW() - INTERVAL 2 DAY),

('a1b2c3d4-e5f6-7890-abcd-101010101010', 'Space Exploration Ethics', 'A discussion on regulations around private space travel and orbital debris', 'space-exploration-ethics', 'As private companies accelerate their space ambitions, ethicists and policymakers are grappling with fundamental questions about the governance of outer space activities. The discussion, hosted by the United Nations Office for Outer Space Affairs, addressed issues including orbital debris management, planetary protection protocols, and the equitable distribution of space resources. Participants debated whether the current international treaty framework, largely developed during the Cold War era, is adequate for regulating commercial space activities. Proposals included a new international body to oversee private space operations and mandatory environmental impact assessments for satellite constellations and lunar mining activities.', 'UN hosts discussion on ethical and regulatory challenges of commercial space activities.', 'https://res.cloudinary.com/demo/image/upload/space_ethics.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/space_ethics.jpg', 6, 1, NULL, 87.00, 1, 0, 0, 0, 0, 0, 290000, 780000, 18000, NOW() - INTERVAL 3 DAY),

-- Top Charts articles
('a1b2c3d4-e5f6-7890-abcd-121212121212', 'Global Economy Outlook', 'Comprehensive analysis of worldwide economic trends and forecasts', 'global-economy-outlook', 'The International Monetary Fund has released its comprehensive Global Economy Outlook report, highlighting divergent recovery paths across different regions. While advanced economies are expected to maintain moderate growth, many emerging markets face headwinds from rising debt costs and commodity price volatility. The report emphasizes the transformative impact of artificial intelligence on productivity growth, projecting that AI adoption could add several percentage points to GDP growth in early-adopting nations. However, the outlook also warns of significant downside risks, including potential financial market disruptions, escalating geopolitical tensions, and the ongoing impacts of climate change on agricultural output and extreme weather events.', 'IMF Global Economy Outlook reveals divergent recovery paths and AI-driven growth potential.', 'https://res.cloudinary.com/demo/image/upload/economy_outlook.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/economy_outlook.jpg', 5, 2, NULL, 95.00, 1, 0, 0, 0, 0, 0, 2400000, 5500000, 280000, NOW() - INTERVAL 10 MINUTE),

('a1b2c3d4-e5f6-7890-abcd-131313131313', 'New Policy Reform', 'Government announces sweeping reforms to education and healthcare', 'new-policy-reform', 'The government has unveiled a comprehensive package of policy reforms targeting education and healthcare systems, representing the most significant overhaul in decades. The education reforms include universal access to digital learning platforms, increased teacher compensation, and curriculum modernization focusing on STEM and critical thinking skills. Healthcare reforms encompass expanded insurance coverage, mental health parity requirements, and incentives for rural medical practice. The reforms are estimated to cost $2 trillion over ten years, funded through a combination of increased taxes on high earners and reallocation of existing budgets. Opposition leaders have criticized the scale of spending while acknowledging the need for systemic improvements.', 'Government unveils $2 trillion reform package for education and healthcare systems.', 'https://res.cloudinary.com/demo/image/upload/policy_reform.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/policy_reform.jpg', 3, 1, NULL, 88.00, 1, 0, 0, 0, 0, 0, 1800000, 4200000, 150000, NOW() - INTERVAL 22 MINUTE),

('a1b2c3d4-e5f6-7890-abcd-141414141414', 'Urban Transit Updates', 'Cities worldwide investing in sustainable public transportation', 'urban-transit-updates', 'Major cities worldwide are accelerating investments in sustainable public transportation systems, driven by climate commitments and growing urban populations. New projects include high-speed rail corridors, electric bus fleets, and innovative last-mile solutions using autonomous vehicles. City planners are increasingly prioritizing transit-oriented development, redesigning urban spaces around public transportation hubs to reduce car dependency. The investments represent a collective commitment of over $500 billion across 150 cities, with funding coming from municipal bonds, federal grants, and public-private partnerships. Experts note that effective public transit is essential for meeting climate targets and improving quality of life in rapidly growing urban areas.', 'Cities worldwide commit $500 billion to sustainable public transportation expansion.', 'https://res.cloudinary.com/demo/image/upload/urban_transit.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/urban_transit.jpg', 8, 3, NULL, 86.00, 1, 0, 0, 0, 0, 0, 1100000, 2800000, 95000, NOW() - INTERVAL 45 MINUTE),

-- Economy Around Globe
('a1b2c3d4-e5f6-7890-abcd-151515151515', 'Global Market Inflation Data', 'Central banks worldwide assess latest inflation metrics', 'global-market-inflation-data', 'Central banks across major economies are carefully analyzing the latest inflation data as they calibrate monetary policy decisions. The data reveals a complex picture: headline inflation has declined in most advanced economies, but core inflation remains persistent in several key markets. Food and energy prices have stabilized, while services inflation continues to pose challenges. The divergent inflation trends have led to different policy responses, with some central banks cutting rates while others maintain restrictive stances. Economists warn that premature policy easing could reignite inflationary pressures, while excessive tightening risks pushing economies into recession. The next quarter will be crucial for determining the trajectory of global monetary policy.', 'Central banks navigate complex inflation landscape with divergent policy approaches.', 'https://res.cloudinary.com/demo/image/upload/inflation_data.jpg', 'https://res.cloudinary.com/demo/image/upload/t_thumb/inflation_data.jpg', 5, 8, NULL, 93.00, 1, 0, 0, 0, 0, 0, 560000, 1500000, 42000, NOW() - INTERVAL 2 HOUR);

-- ============================================================
-- Article Tags
-- ============================================================
INSERT INTO article_tags (article_id, tag_id) VALUES
(1, 4), (1, 12),
(2, 3),
(3, 12),
(4, 2),
(5, 12),
(6, 2),
(7, 5),
(8, 11),
(9, 1), (9, 10),
(10, 7),
(11, 8),
(12, 6),
(13, 8),
(14, 1), (14, 10),
(15, 12),
(16, 5),
(17, 12), (17, 4),
(18, 11),
(19, 10),
(20, 12);

-- ============================================================
-- Article Regions
-- ============================================================
INSERT INTO article_regions (article_id, region_id) VALUES
(1, 1), (1, 2), (1, 3),
(2, 1), (2, 2), (2, 3),
(3, 7),
(4, 2), (4, 3),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 3),
(7, 1),
(8, 2),
(9, 2), (9, 7),
(10, 1), (10, 2), (10, 3),
(11, 2), (11, 4),
(12, 1), (12, 8),
(13, 7),
(14, 2), (14, 9),
(15, 1), (15, 2),
(16, 1), (16, 2), (16, 3),
(17, 1), (17, 2), (17, 3),
(18, 1), (18, 2), (18, 3),
(19, 1), (19, 2), (19, 3),
(20, 1), (20, 2), (20, 3));

-- ============================================================
-- Newspapers (Today's editions)
-- ============================================================
INSERT INTO newspapers (source_id, title, cover_image_url, pdf_url, edition_date) VALUES
(1, 'The New York Times - Daily Edition', 'https://res.cloudinary.com/demo/image/upload/nyt_front.jpg', NULL, CURDATE()),
(2, 'Wall Street Journal - Daily Edition', 'https://res.cloudinary.com/demo/image/upload/wsj_front.jpg', NULL, CURDATE()),
(6, 'Financial Times - Daily Edition', 'https://res.cloudinary.com/demo/image/upload/ft_front.jpg', NULL, CURDATE());

-- ============================================================
-- Radio Streams
-- ============================================================
INSERT INTO radio_streams (source_id, title, description, stream_url, thumbnail_url, is_live, is_high_quality, listener_count, display_order) VALUES
(3, 'BBC World', 'BBC World Service live radio broadcast covering global news 24/7.', 'https://stream.bbc.co.uk/bbc_world_service', 'https://res.cloudinary.com/demo/image/upload/bbc_radio.jpg', 1, 1, 45200, 1),
(4, 'Market Update', 'Reuters live market analysis and financial news commentary.', 'https://stream.reuters.com/live_market', 'https://res.cloudinary.com/demo/image/upload/reuters_radio.jpg', 1, 1, 23100, 2),
(4, 'Reuters Financial Brief', 'Daily financial briefing with in-depth market analysis.', 'https://stream.reuters.com/financial_brief', 'https://res.cloudinary.com/demo/image/upload/reuters_financial.jpg', 1, 0, 18700, 3),
(5, 'Al Jazeera', 'Al Jazeera live English radio service covering Middle East and world news.', 'https://stream.aljazeera.com/live_english', 'https://res.cloudinary.com/demo/image/upload/aj_radio.jpg', 1, 1, 31500, 4),
(6, 'Financial Times', 'FT live business and financial news radio broadcast.', 'https://stream.ft.com/live_radio', 'https://res.cloudinary.com/demo/image/upload/ft_radio.jpg', 1, 1, 19800, 5),
(1, 'The NYT', 'New York Times audio news and analysis.', 'https://stream.nytimes.com/live_audio', 'https://res.cloudinary.com/demo/image/upload/nyt_radio.jpg', 1, 0, 27300, 6);

-- ============================================================
-- Podcasts
-- ============================================================
INSERT INTO podcasts (source_id, title, description, audio_url, thumbnail_url, duration_seconds, episode_number, published_at) VALUES
(3, 'BBC World Service Podcast', 'Daily digest of the most important global news stories.', 'https://podcasts.bbc.co.uk/world_service_daily.mp3', 'https://res.cloudinary.com/demo/image/upload/bbc_podcast.jpg', 1800, 342, NOW() - INTERVAL 1 DAY),
(8, 'Bloomberg Markets', 'In-depth analysis of global financial markets and economic trends.', 'https://podcasts.bloomberg.com/markets.mp3', 'https://res.cloudinary.com/demo/image/upload/bloomberg_podcast.jpg', 2400, 215, NOW() - INTERVAL 1 DAY),
(1, 'The Daily - NYT', 'The biggest stories, explained with the help of NYT journalists.', 'https://podcasts.nytimes.com/the_daily.mp3', 'https://res.cloudinary.com/demo/image/upload/nyt_daily_podcast.jpg', 1500, 892, NOW() - INTERVAL 1 DAY);

-- ============================================================
-- Trending Topics
-- ============================================================
INSERT INTO trending_topics (title, slug, engagement_score, engagement_label, region_id, is_active) VALUES
('Climate Accord 2.0', 'climate-accord-2', 89000, '+19% engagement', NULL, 1),
('Semiconductor Rivalry', 'semiconductor-rivalry', 76000, '+8% engagement', 3, 1),
('AI Regulation Framework', 'ai-regulation-framework', 92000, '+24% engagement', NULL, 1),
('Digital Currency Revolution', 'digital-currency-revolution', 65000, '+12% engagement', 1, 1);

-- Trending topic articles
INSERT INTO trending_topic_articles (topic_id, article_id) VALUES
(1, 9), (1, 14),
(2, 4), (2, 6),
(3, 2),
(4, 12);

-- ============================================================
-- Regional Charts
-- ============================================================
INSERT INTO regional_charts (`rank`, title, metric_label, region_id, article_id, chart_date) VALUES
(1, 'Electric Aviation', '+124% interest in Western Europe', 9, NULL, CURDATE()),
(2, 'Remote Work Policy', '+108% interest in North America', 7, 18, CURDATE()),
(3, 'Nuclear Fusion', '+96% interest in East Asia', 11, NULL, CURDATE()),
(1, 'Digital Currency Adoption', '+156% interest in South America', 8, 12, CURDATE()),
(2, 'Green Energy Infrastructure', '+89% interest in South Asia', 12, 14, CURDATE()),
(3, 'AI Healthcare Systems', '+78% interest in Southeast Asia', 13, NULL, CURDATE());

-- ============================================================
-- World Map Insights
-- ============================================================
INSERT INTO world_map_insights (title, description, latitude, longitude, icon_type, article_id, is_active) VALUES
('East Europe: Strategic realignment detected near border', 'Military movements and diplomatic shifts observed in Eastern European border regions.', 50.4501, 30.5234, 'alert', 11, 1),
('Central Asia: New trade agreement signed', 'Central Asian nations finalize comprehensive economic cooperation framework.', 41.2995, 69.2401, 'trade', NULL, 1),
('South Pacific: Climate summit concludes', 'Pacific Island nations reach consensus on climate action and adaptation funding.', -17.7134, 178.0650, 'climate', 9, 1),
('North Africa: Infrastructure development', 'Major infrastructure projects announced across North African nations.', 33.9716, -6.8498, 'development', NULL, 1);

-- ============================================================
-- Compare Coverages
-- ============================================================
INSERT INTO compare_coverages (topic_title, is_active) VALUES
('G7 Climate Agreements', 1),
('AI Regulation Approaches', 1);

INSERT INTO compare_coverage_items (compare_id, source_id, headline, stance_label, article_id) VALUES
(1, 1, 'G7 leaders commit to bold climate action with $100B fund', 'Market-led solutions', 9),
(1, 3, 'G7 climate deal falls short of activist demands', 'Insufficient commitments', 9),
(1, 5, 'Developing nations cautiously welcome G7 climate package', 'Pragmatic optimism', 9),
(2, 4, 'EU proposes comprehensive AI regulatory framework', 'Strict oversight', 2),
(2, 2, 'Tech industry warns AI regulation could stifle innovation', 'Light-touch approach', 2),
(2, 8, 'Markets react to divergent AI policy signals globally', 'Economic impact focus', 2);
