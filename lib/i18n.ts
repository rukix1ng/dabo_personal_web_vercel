export const locales = ["en", "zh", "ja"] as const;
export type Locale = (typeof locales)[number];
export const publicLocales = ["en", "ja"] as const;
export type PublicLocale = (typeof publicLocales)[number];

export const defaultLocale: Locale = "en";

export const localeLabels: Record<Locale, string> = {
  en: "English",
  zh: "中文",
  ja: "日本語",
};

export const content = {
  en: {
    meta: {
      title: "Industry-Academia Exchange Platform for Semiconductor Equipment Materials | A Collaborative Project of NIMS and Lam Research",
      description:
        "Industry-academia exchange platform for semiconductor equipment materials, developed under a collaborative project between Lam Research and NIMS. Focused on joint research, invited talks, and research outcomes for next-generation semiconductor equipment materials.",
      keywords: [
        "semiconductor equipment",
        "semiconductor materials",
        "Lam Research",
        "NIMS",
        "electron beam materials",
        "etching equipment",
        "materials research",
        "industry-academia collaboration",
      ],
    },
    hero: {
      name: "High-Performance Materials for Semiconductor Manufacturing Systems",
      title: "A collaborative research project between Lam Research and NIMS",
      description: "This project is based on a strategic donation and collaboration from Lam Research Corporation (Fremont, U.S.A.) to the National Institute for Materials Science (NIMS, Tsukuba, Japan). NIMS Principal Researcher Dr. Da Bo serves as the project leader and donation recipient."
    },
    info: {
      phoneLabel: "Phone",
      phone: "+86 000-0000-0000",
      addressLabel: "Address",
      address: "National Institute for Materials Science (NIMS) 1-2-1 Sengen, Tsukuba, Ibaraki 305-0047, Japan",
      emailLabel: "Email",
      email: "DA.Bo@nims.go.jp",
      fieldsLabel: "Research Directions",
      fields: [
        "Semiconductor Equipment",
        "Semiconductor Equipment Materials",
        "Etching Equipment Materials",
        "Electron Beam Equipment Materials",
        "Electron Beam Metrology Algorithms",
        "Electron Beam-Material Interaction",
      ],
    },
    sections: {
      industryIntro: {
        title: "Background Introduction",
        content: "The semiconductor industry has become a global foundational industry, supporting a wide range of fields including information and communications, high-performance computing, automotive electronics, and energy. It is a highly internationalized industry characterized by a close division of labor across regions in design, manufacturing, packaging, and testing. Among these, semiconductor manufacturing is a typical \"equipment-driven\" industry, whose production capacity and technological capability depend to a large extent on the manufacturing equipment employed.\n\nAs advanced process technologies continue toward smaller feature sizes and higher integration, equipment structures as well as optical and circuit designs are gradually approaching feasible limits. The room for performance improvement through architectural optimization alone is steadily narrowing. Key materials such as electron sources, optical and electron-optical components, and highly durable structural materials are therefore becoming increasingly important breakthrough directions for the development of next-generation semiconductor equipment.\n\nAgainst this background, [Lam Research](https://www.lamresearch.com/) and the [National Institute for Materials Science (NIMS)](https://www.nims.go.jp/eng/) in Japan are engaged in a long-term collaborative research program on high-performance materials for semiconductor manufacturing systems. The project focuses on material performance and application issues under extreme operating conditions and continues to advance related research efforts under the leadership of Dr. Da Bo, Principal Researcher at [NIMS](https://www.nims.go.jp/eng/).\n\nBuilt on this collaborative project, the initiative aims to strengthen academic exchange and collaborative research in the field of semiconductor equipment materials. On the one hand, it promotes researchers' understanding of material needs in semiconductor equipment companies through academic visits, joint research, and thematic talks. On the other hand, it enhances industrial awareness of relevant research progress through information sharing and dissemination of outcomes, thereby promoting effective connections between industrial demand and research directions.\n\n[Lam Research](https://www.lamresearch.com/) is a global leader in semiconductor equipment and has long been committed to advancing and innovating key technologies related to semiconductor manufacturing through collaboration with research institutions worldwide.\n\n[NIMS](https://www.nims.go.jp/eng/) is one of Japan's leading national research institutions, conducting systematic basic and applied research in materials science while maintaining extensive collaborations with universities and industry in Japan and abroad."
      },
      projectNews: {
        title: "News",
        featured: [
          {
            id: 1,
            title: "NIMS and Lam Research Announce Strategic Partnership",
            date: "2026-02-15",
            image: "",
            description: "Major collaboration to advance semiconductor equipment materials research"
          },
          {
            id: 2,
            title: "Breakthrough in High-Performance Materials Development",
            date: "2026-02-10",
            image: "",
            description: "New electron source materials show promising results in initial testing"
          },
          {
            id: 3,
            title: "International Research Exchange Program Launched",
            date: "2026-02-05",
            image: "",
            description: "Inviting materials researchers across Japan to collaborate at NIMS"
          }
        ],
        list: [
          { title: "First Joint Research Seminar Successfully Held", date: "02-09" },
          { title: "Project Team Visits Lam Research Headquarters", date: "02-06" },
          { title: "New Laboratory Facilities Inaugurated", date: "02-01" },
          { title: "Research Findings Published in Leading Journal", date: "01-28" },
          { title: "Industry-Academia Forum Scheduled for March", date: "01-25" }
        ]
      },
      shortBioTitle: "Short Bio",
      shortBio:
        "Your Name is an assistant professor specializing in theoretical physics and semiconductor research. Their work bridges quantum theory, material modeling, and device-level applications with a focus on scalable, energy-efficient technologies.",
      longBioTitle: "Long Bio",
      longBio: [
        "Your Name received a Ph.D. in Physics from Your University and completed postdoctoral training in condensed matter theory. They joined the Institute of Theoretical Physics in 2022 and currently lead a semiconductor research group focused on quantum devices and low-dimensional materials.",
        "Their research combines ab initio modeling, transport theory, and device simulation to understand charge, spin, and heat dynamics in emerging semiconductor systems. Their work has been published in leading journals and presented at international conferences in physics and materials science.",
      ],
      personalIntroTitle: "Project Leader",
      personalProfile: {
        title: "Introduction",
        content:
          "Dr. Da Bo is currently a Principal Researcher at the [National Institute for Materials Science (NIMS)](https://www.nims.go.jp).",
      },
      mainResearchAreas: {
        title: "Main Research Areas",
        content:
          "Dr. Da Bo's research primarily focuses on computational physics, materials physics, and advanced materials characterization. His core areas include:\n\n**1. Surface Analysis of Nanomaterials:** Dedicated to solving the signal extraction challenges of substrate-supported nanomaterials, developing new methods to obtain intrinsic material information.\n\n**2. Electron Microscopy & Electron Beam Theory:** Studying the interaction between charged particles and materials, low-energy electron transport properties, and design principles of electron beam equipment.\n\n**3. Materials Informatics & AI Metrology:** Applying machine learning algorithms to traditional measurement instruments to extract weak signals from complex backgrounds, improving measurement accuracy and efficiency.",
      },
      researchContent: {
        title: "Research Content",
        keywords: ["Nanomaterial", "Surface analysis", "Background signal", "Secondary electron"],
        description:
          "Dr. Da Bo has achieved revolutionary breakthroughs in electron microscopy algorithms, software development, and experimental verification. His major research achievements include:\n\n**1. Virtual Substrate Method and Background Signal Analysis:** Addressing the challenge of nanomaterial signals being masked by substrate signals in traditional reflection mode, Dr. Da Bo, inspired by the \"four-point probe method\" and the \"chop-nod method\" in infrared astronomy, proposed the \"Virtual Substrate Method.\" This method establishes a new benchmark for surface analysis, eliminating substrate interference and extracting \"free-standing\" information of nanomaterials from secondary electron spectra. This enables quantitative detection of electron-electron interactions in nanomaterials through energy-filtered scanning electron microscopy (EF-SEM).\n\n**2. Heuristic Data-driven Spectral Analysis:** He successfully introduced artificial intelligence technology into weak signal measurement, developing machine learning-based analysis algorithms. This method not only significantly improved the signal-to-noise ratio in semiconductor material detection but also achieved cross-domain applications, such as successful transformation in Raman spectroscopy non-invasive blood glucose detection technology.\n\n**3. Electronic Poisson's Spot and Novel \"Rotational Crystal\" Materials:** In fundamental physics experiments, Dr. Da Bo first predicted and discovered the \"Poisson's spot\" phenomenon in electronics, providing theoretical support for next-generation parallel electron beam lithography technology. During this process, he discovered an axially symmetric \"rotational crystal material\" between quasicrystals and crystals, a discovery evaluated as having Nobel Prize potential.",
        detailedDescription:
          "Characterization techniques available for bulk or thin-film solid-state materials have been extended to substrate-supported nanomaterials, but generally non-quantitatively. This is because the nanomaterial signals are inevitably buried in the signals from the underlying substrate in common reflection-configuration techniques. Here, we propose a virtual substrate method, inspired by the four-point probe technique for resistance measurement as well as the chop-nod method in infrared astronomy, to characterize nanomaterials without the influence of underlying substrate signals from four interrelated measurements. This method in secondary electron (SE) microscopy, a SE spectrum (white electrons) associated with the reflectivity difference between two different substrates can be tracked and controlled. The SE spectrum is used to quantitatively investigate the covering nanomaterial based on subtle changes in the transmission of the nanomaterial with high efficiency rivaling that of conventional core-level electrons. The virtual substrate method represents a benchmark for surface analysis to provide \"free-standing\" information about supported nanomaterials.",
      },
      experience: {
        title: "Experience",
        items: [
          { year: "April 2019 – Present", institution: "[National Institute for Materials Science (NIMS)](https://www.nims.go.jp)", position: "Principal Researcher" },
          { year: "December 2016 – April 2019", institution: "[National Institute for Materials Science (NIMS)](https://www.nims.go.jp)", position: "Researcher" },
          { year: "January 2015 – December 2016", institution: "[National Institute for Materials Science (NIMS)](https://www.nims.go.jp)", position: "ICYS Researcher" },
          { year: "November 2013 – January 2015", institution: "[National Institute for Materials Science (NIMS)](https://www.nims.go.jp)", position: "Postdoctoral Researcher" },
          { year: "September 2008 – June 2013", institution: "[University of Science and Technology of China (USTC)](https://www.ustc.edu.cn)", position: "Ph.D. in Physics" },
          { year: "September 2004 – June 2008", institution: "[University of Science and Technology of China (USTC)](https://www.ustc.edu.cn)", position: "B.S. in Physics" },
        ],
      },
      academicPositions: {
        title: "Honors & Professional Recognition",
        items: [
          "Head of External Relations and Liaison, Japan Society for Applied Surface Analysis",
          "President, Japan Monte Carlo Method Association",
          "Chair, Shimizu Award Selection Committee",
          "Vice President, Materials Division, Japan Doctoral Association",
          "Director, NIMS Branch, USTC Japan Alumni Association",
          "Creator of NIMS Official Slogan: \"Materials Change the World, We Create Materials\"",
        ],
      },
      projectsTitle: "Projects & Consulting",
      projects: [
        "National program on quantum-enabled semiconductor devices",
        "Industry collaboration on wide-bandgap materials reliability",
        "Cross-disciplinary initiative on nanoscale heat transport",
      ],
      conferencesTitle: "Conferences & Media",
      conferences: [
        "Invited talks at APS March Meeting and MRS",
        "Keynote on quantum device modeling at NanoTech Summit",
        "Featured in university research highlights and science media",
      ],
    },
    common: {
      backToList: "Back to List",
      noData: "No data available",
      loading: "Loading...",
      authorBio: "About the Author",
      abstract: "Abstract",
      speakerLabel: "Speaker: ",
      institutionLabel: "Institution: ",
      dateLabel: "Date: ",
    },
    navigation: {
      overview: "Overview",
      bio: "Biography",
      projects: "Projects",
      media: "Media",
      contact: "Contact",
      home: "Home",
      forum: "Invited Talks",
      achievements: "News",
      papers: "Collaborative Papers",
    },
    papers: {
      title: "Collaborative Papers",
      description: "A comprehensive list of published research papers and publications.",
      previous: "Previous",
      next: "Next",
      pageInfo: "Page {current} of {total}",
      noResults: "No papers found.",
      showing: "Showing",
      to: "to",
      of: "of",
      items: "items",
      sponsorLabel: "Sponsor",
    },
    forum: {
      title: "Invited Talks",
      inviterIntro: {
        title: "Project Introduction",
        content: "This project focuses on key material issues in semiconductor manufacturing systems and regularly organizes academic talks and exchange activities. These activities center on materials science, electron optics, and semiconductor equipment, promoting academic exchange among researchers from different fields and advancing effective connections between research directions and practical needs.\n\nThis talk series is continuously carried out as part of the project's exchange mechanism."
      },
      host: "Host",
      speaker: "Speaker",
      date: "Date",
      viewDetails: "View Details",
      introduction: "Introduction",
      backToList: "Back to Forum List",
      noInvitations: "No invited talks yet",
    },
    achievements: {
      mediaReports: {
        title: "News Column",
        readMore: "READ MORE",
        items: [
          {
            image: "/media-report-1.png",
            title: "Breakthrough in Semiconductor Manufacturing Equipment: Precise Control of Electron Beams with World's First Crystal",
            content: "NIMS Principal Researcher Dr. Bo Da interviewed on the development of breakthrough technology for precision electron beam control using a world-first crystal structure, supported by TNP Partners in Yokohama.",
            date: "2025-04",
            journals: ["Regional Economic Intelligence"],
          },
          {
            images: [
              { src: "/media-report-2c.png", alt: "Surface-Sensitive Low-Speed Electron Distance (Kagaku Shimbun)" },
              { src: "/media-report-2b.png", alt: "Electron Travel Distance Calculation (Nikkan Kogyo Shimbun)" },
              { src: "/media-report-2a.png", alt: "NIMS New Algorithm (Nikkan Sangyo Shimbun)" },
              { src: "/media-report-2d.png", alt: "Algorithm for Low-Speed Electron Travel Distance (NIMS News)" }
            ],
            title: "High-accuracy electron-solid interaction model",
            content: "Dr. Bo Da's specialized algorithms for precisely calculating electron travel distance were featured across multiple major scientific outlets, representing a fundamental advance in surface analysis characterization.",
            date: "2014-08/09",
            journals: ["Kagaku Shimbun", "Nikkan Kogyo Shimbun", "Nikkan Sangyo Shimbun", "NIMS News"],
          },
          {
            image: "/media-report-3.png",
            title: "President's Prize Awarded for Surface Analysis Innovation",
            content: "NIMS recognizes outstanding contribution to materials science with prestigious award for groundbreaking measurement techniques in surface analysis.",
            date: "2020-09",
            journals: ["NIMS News"],
          },
        ],
      },
      awards: {
        title: "Awards and Honors",
        items: [
          { year: "2023", name: "Kurata Grant, The Hitachi Global Foundation" },
          { year: "2023", name: "Iketani Science and Technology Foundation Research Grant, Iketani Science and Technology Foundation" },
          { year: "2020", name: "Kao Science Award, Kao Foundation for Arts and Sciences" },
          { year: "2019", name: "Excellent Presentation Award, NIMS WEEK Organizing Committee" },
          { year: "2018", name: "Excellent Presentation Award, Joint Symposium on Materials Integration and Advanced Characterization Executive Committee" },
          { year: "2017", name: "President's Award for Progress, NIMS Board of Directors" },
          { year: "2016", name: "Excellent Presentation Award, Joint Symposium on Multi-field Measurements Executive Committee" },
        ],
      },
      noNewsColumns: "No news columns yet",
    },
  },
  zh: {
    meta: {
      title: "半导体装备材料产学交流平台 | NIMS-泛林集团合作项目",
      description:
        "半导体装备材料产学交流平台，基于 NIMS 与泛林集团合作项目建设，聚焦联合研究、邀请报告与研究成果交流，服务新一代半导体装备关键材料发展。",
      keywords: [
        "半导体装备",
        "半导体材料",
        "泛林集团",
        "NIMS",
        "电子束材料",
        "刻蚀装备",
        "材料研究",
        "产学合作",
      ],
    },
    hero: {
      name: "面向半导体制造系统的高性能材料研究项目",
      title: "Lam Research 与 NIMS 联合研究项目",
      description: "本项目基于泛林集团（Lam Research Corporation, Fremont, U.S.A.）向日本国立材料研究所（NIMS, Tsukuba, Japan）提供的战略性捐赠及相关合作开展，日本国立材料研究所达博主任研究员为项目负责人及捐赠接收方。"
    },
    info: {
      phoneLabel: "电话",
      phone: "+86 000-0000-0000",
      addressLabel: "地址",
      address: "国立研究開発法人物質・材料研究機構 〒305-0047 茨城県つくば市千現1-2-1",
      emailLabel: "邮箱",
      email: "DA.Bo@nims.go.jp",
      fieldsLabel: "研究方向",
      fields: [
        "半导体装备",
        "半导体装备材料",
        "刻蚀装备材料",
        "电子束装备材料",
        "电子束量检测算法",
        "电子束与材料项目作用",
      ],
    },
    sections: {
      industryIntro: {
        title: "背景介绍",
        content: "半导体产业已成为全球性的基础产业，支撑着信息通信、高性能计算、汽车电子和能源等诸多领域。这是一个高度国际分工协作的产业，各地区在设计、制造、封装测试等环节紧密配合。其中，半导体制造是典型的“装备驱动型”产业，其生产能力和技术水平在很大程度上取决于所采用的制造装备。\n\n随着先进制程向更小特征尺寸和更高集成度推进，装备结构以及光学、电路设计已逐步接近可行极限，单纯依靠架构优化提升性能的空间逐渐收窄。电子源、光学与电子光学元件、高耐受结构材料等关键材料，正日益成为推动新一代半导体装备发展的重要突破方向。\n\n在这一背景下，[Lam Research](https://www.lamresearch.com/) 与日本[物质・材料研究机构（NIMS）](https://www.nims.go.jp/)围绕半导体制造系统中的高性能材料开展长期合作研究，重点聚焦极端工况条件下材料性能与应用问题，并持续推进相关研究工作的深入开展。该项目由 [NIMS](https://www.nims.go.jp/) 主任研究员达博博士负责推进。\n\n依托该合作项目，旨在加强半导体装备材料领域的学术交流与协同研究。一方面，通过组织学术访问、联合研究及专题报告等形式，促进研究人员对半导体装备企业在材料方面需求的理解；另一方面，通过信息发布与成果传播，加强产业界对相关研究进展的认知，推动产业需求与科研方向之间的有效衔接。\n\n[Lam Research](https://www.lamresearch.com/) 是一家全球领先的半导体设备企业，长期致力于通过与全球科研机构的合作，推动半导体制造相关关键技术的发展与创新。\n\n[NIMS](https://www.nims.go.jp/) 是日本代表性的国立研究机构之一，围绕材料科学领域开展系统性的基础研究与应用研究，并与国内外高校及产业界保持广泛合作。"
      },
      projectNews: {
        title: "新闻",
        featured: [
          {
            id: 1,
            title: "NIMS与泛林集团宣布战略合作伙伴关系",
            date: "2026-02-15",
            image: "",
            description: "推进半导体装备材料研究的重大合作"
          },
          {
            id: 2,
            title: "高性能材料开发取得突破",
            date: "2026-02-10",
            image: "",
            description: "新型电子源材料在初步测试中显示出良好前景"
          },
          {
            id: 3,
            title: "国际研究交流项目启动",
            date: "2026-02-05",
            image: "",
            description: "邀请日本各地材料研究人员在NIMS开展合作"
          }
        ],
        list: [
          { title: "首次联合研究研讨会成功举办", date: "02-09" },
          { title: "项目团队访问泛林集团总部", date: "02-06" },
          { title: "新实验室设施落成启用", date: "02-01" },
          { title: "研究成果发表于顶级期刊", date: "01-28" },
          { title: "产学论坛定于三月举行", date: "01-25" }
        ]
      },
      shortBioTitle: "简短简介",
      shortBio:
        "你的姓名为理论物理与半导体研究方向的助理教授，研究贯通量子理论、材料建模与器件应用，关注可扩展的高效能技术。",
      longBioTitle: "详细简介",
      longBio: [
        "你的姓名毕业于某某大学物理学博士，随后从事凝聚态理论博士后研究。2022 年加入理论物理研究所，现主持半导体研究组，聚焦量子器件与低维材料。",
        "研究结合第一性原理建模、输运理论与器件仿真，揭示新型半导体体系中的电荷、自旋与热输运机制。相关成果发表于重要期刊，并在国内外学术会议报告。",
      ],
      personalIntroTitle: "项目负责人",
      personalProfile: {
        title: "个人简介",
        content:
          "达博博士现任[日本国立材料科学研究所（NIMS）](https://www.nims.go.jp)主任研究员。",
      },
      mainResearchAreas: {
        title: "主要研究领域",
        content:
          "达博博士的研究主要集中在计算物理、材料物理以及先进材料表征领域，核心方向包括：\n\n**1. 纳米材料表面分析 (Surface Analysis of Nanomaterials):** 专注于解决衬底支撑纳米材料的信号提取难题，通过开发新方法获取材料的本征信息。\n\n**2. 电子显微学与电子束理论 (Electron Microscopy & Beam Theory):** 研究带电粒子与材料的相互作用、低能电子输运性质以及电子束设备的设计原理。\n\n**3. 材料信息学与AI测量 (Materials Informatics & AI Metrology):** 将机器学习算法应用于传统测量仪器，从复杂背景中提取微弱信号，提升测量精度与效率。",
      },
      researchContent: {
        title: "研究内容",
        keywords: ["纳米材料", "表面分析", "背景信号", "二次电子"],
        description:
          "达博博士在电子显微镜算法、软件开发及实验验证方面取得了革命性突破，主要研究成果包括：\n\n**1. 虚拟衬底法（Virtual Substrate Method）与背景信号分析** 针对传统反射模式下纳米材料信号易被衬底信号掩盖的难题，达博博士受\"四探针法\"及红外天文学\"斩波-点头法\"启发，提出了\"虚拟衬底法\"。该方法建立了一个全新的表面分析基准，能够消除衬底干扰，从二次电子光谱中提取出纳米材料的\"自支撑\"信息（Free-standing information）。这使得通过能量过滤扫描电子显微镜（EF-SEM）定量探测纳米材料的电子-电子相互作用成为可能。\n\n**2. 启发式数据驱动的光谱分析（Heuristic Data-driven Spectral Analysis）** 他成功将人工智能技术引入微弱信号测量，开发了基于机器学习的分析算法。该方法不仅显著提高了半导体材料检测的信噪比，还实现了跨领域应用，例如在拉曼光谱无损血糖检测技术中的成功转化。\n\n**3. 电子学泊松亮斑与新型\"旋转晶体\"材料** 在基础物理实验方面，达博博士首次预言并发现了电子学中的\"泊松亮斑\"现象，为下一代并行电子束光刻技术提供了理论支撑。在此过程中，他发现了一种介于准晶体与晶体之间的轴对称\"旋转晶体材料\"，该发现被评价为具有诺贝尔奖潜力的突破性研究。",
        detailedDescription:
          "适用于块体或薄膜固态材料的表征技术已扩展到基底支撑的纳米材料，但通常是非定量的。这是因为在常见的反射配置技术中，纳米材料信号不可避免地埋藏在底层基底的信号中。在这里，我们提出了一种虚拟基底方法，灵感来自电阻测量的四探针技术以及红外天文学中的 chop-nod 方法，通过四个相互关联的测量来表征纳米材料，而不受底层基底信号的影响。这种在二次电子（SE）显微镜中的方法，可以跟踪和控制与两种不同基底之间的反射率差异相关的 SE 光谱（白电子）。SE 光谱用于基于纳米材料透射的细微变化来定量研究覆盖的纳米材料，其效率可与传统的芯能级电子相媲美。虚拟基底方法代表了表面分析的基准，为支撑纳米材料提供\"独立\"信息。",
      },
      experience: {
        title: "经历",
        items: [
          { year: "2019年4月 – 至今", institution: "[日本国立材料科学研究所（NIMS）](https://www.nims.go.jp)", position: "主任研究员" },
          { year: "2016年12月 – 2019年4月", institution: "[日本国立材料科学研究所（NIMS）](https://www.nims.go.jp)", position: "研究员" },
          { year: "2015年1月 – 2016年12月", institution: "[日本国立材料科学研究所（NIMS）](https://www.nims.go.jp)", position: "ICYS 研究员" },
          { year: "2013年11月 – 2015年1月", institution: "[日本国立材料科学研究所（NIMS）](https://www.nims.go.jp)", position: "博士后研究员" },
          { year: "2008年9月 – 2013年6月", institution: "[中国科学技术大学](https://www.ustc.edu.cn)", position: "理学博士（物理学）" },
          { year: "2004年9月 – 2008年6月", institution: "[中国科学技术大学](https://www.ustc.edu.cn)", position: "理学学士（物理学）" },
        ],
      },
      academicPositions: {
        title: "获得荣誉",
        items: [
          "日本应用表面分析学会 对外联系交涉部负责人",
          "日本蒙特卡洛方法协会 理事长",
          "Shimizu奖 评选委员会委员长",
          "日本博士协会 材料部门副会长",
          "中国科学技术大学日本校友会 科研所分会长",
          "NIMS官方标语制定者：\"材料改变世界，我们创造材料\"",
        ],
      },
      projectsTitle: "项目与咨询",
      projects: [
        "量子增强半导体器件国家重点项目",
        "宽禁带材料可靠性产业合作",
        "纳米尺度热输运交叉研究计划",
      ],
      conferencesTitle: "会议与媒体",
      conferences: [
        "APS March Meeting、MRS 邀请报告",
        "纳米器件建模主题大会主旨演讲",
        "高校科研动态与科普媒体报道",
      ],
    },
    common: {
      backToList: "返回列表",
      noData: "暂无数据",
      loading: "加载中...",
      authorBio: "作者简介",
      abstract: "报告摘要",
      speakerLabel: "主讲人：",
      institutionLabel: "主讲人单位：",
      dateLabel: "报告时间：",
    },
    navigation: {
      overview: "概览",
      bio: "简介",
      projects: "项目",
      media: "媒体",
      contact: "联系",
      home: "首页",
      forum: "邀请报告",
      achievements: "新闻专栏",
      papers: "合作论文",
    },
    papers: {
      title: "合作论文",
      description: "已发表的研究论文和出版物的完整列表。",
      previous: "上一页",
      next: "下一页",
      pageInfo: "第 {current} 页，共 {total} 页",
      noResults: "未找到论文。",
      showing: "显示",
      to: "-",
      of: "条，共",
      items: "条数据",
      sponsorLabel: "赞助企业",
    },
    forum: {
      title: "邀请报告",
      inviterIntro: {
        title: "项目介绍",
        content: "本项目围绕半导体制造系统中的关键材料问题，定期组织学术报告与交流活动。相关活动聚焦材料科学、电子光学及半导体装备等方向，促进不同领域研究人员之间的学术交流，并推动研究方向与实际需求之间的有效衔接。\n\n本报告系列作为项目交流机制的一部分持续开展。"
      },
      host: "主持人",
      speaker: "主讲人",
      date: "举办时间",
      viewDetails: "查看详情",
      introduction: "论坛介绍",
      backToList: "返回论坛列表",
      noInvitations: "暂无邀请报告",
    },
    achievements: {
      mediaReports: {
        title: "新闻专栏",
        readMore: "阅读更多",
        items: [
          {
            image: "/media-report-1.png",
            title: "半导体制造装置取得突破：利用世界首个结晶体精确控制电子束",
            content: "NIMS 主任研究员达博博士接受采访，介绍了一项利用世界首创结晶结构实现精密电子束控制的突破性技术，该技术由横滨 TNP Partners 提供支持。",
            date: "2025年4月",
            journals: ["地域经济情报"],
          },
          {
            images: [
              { src: "/media-report-2c.png", alt: "低速电子距离（科学新闻）" },
              { src: "/media-report-2b.png", alt: "电子走行距离计算（日刊工业新闻）" },
              { src: "/media-report-2a.png", alt: "NIMS 新算法（日刊产业新闻）" },
              { src: "/media-report-2d.png", alt: "低速电子走行距离算法（NIMS 新闻）" }
            ],
            title: "高准确度电子与固体相互作用模型",
            content: "达博博士开发的用于精确计算电子走行距离的专门算法被多家主流科学媒体报道，代表了表面分析表征领域的重大进展。",
            date: "2014年8月/9月",
            journals: ["科学新闻", "日刊工业新闻", "日刊产业新闻", "NIMS News"],
          },
          {
            image: "/media-report-3.png",
            title: "表面分析创新获总裁奖",
            content: "NIMS 表彰在材料科学领域的杰出贡献，授予突破性测量技术方面的最高荣誉（NIMS 总裁奖）。",
            date: "2020年9月",
            journals: ["NIMS News"],
          },
        ],
      },
      awards: {
        title: "获得奖项",
        items: [
          { year: "2023年", name: "仓田奖励金 -- 日本日立财团" },
          { year: "2023年", name: "池谷财团研究助成金 -- 日本池谷科学技术振兴财团" },
          { year: "2020年", name: "花王科学奖励金 -- 日本花王财团" },
          { year: "2019年", name: "优秀发表赏 -- 日本国立材料研究所 NIMS WEEK 组委会" },
          { year: "2018年", name: "优秀发表赏 -- 日本材料集成与先进材料表征联合研讨会执行委员会" },
          { year: "2017年", name: "理事长进步赏 -- 日本国立材料研究所理事会" },
          { year: "2016年", name: "优秀发表赏 -- 日本多领域测量联合研讨会执行委员会" },
        ],
      },
      noNewsColumns: "暂无新闻专栏",
    },
  },
  ja: {
    meta: {
      title: "半導体装置材料産学交流プラットフォーム | NIMS・ラムリサーチ共同プロジェクト",
      description:
        "NIMS とラムリサーチの共同プロジェクトに基づく半導体装置材料の産学交流プラットフォーム。共同研究、招待講演、研究成果の発信を通じて、次世代半導体装置材料の発展を支えます。",
      keywords: [
        "半導体装置",
        "半導体材料",
        "ラムリサーチ",
        "NIMS",
        "電子ビーム材料",
        "エッチング装置",
        "材料研究",
        "産学連携",
      ],
    },
    hero: {
      name: "半導体製造システムに向けた高性能材料研究プロジェクト",
      title: "ラムリサーチと国立研究開発法人NIMS（物質・材料研究機構）の共同研究",
      description: "本プロジェクトは、Lam Research Corporation（米国フリーモント）から国立研究開発法人物質・材料研究機構（NIMS、日本つくば）への戦略的寄付および関連協力に基づいて実施されています。NIMS主任研究員の達博博士がプロジェクトリーダーおよび寄付受領者を務めています。"
    },
    info: {
      phoneLabel: "電話",
      phone: "+86 000-0000-0000",
      addressLabel: "住所",
      address: "国立研究開発法人物質・材料研究機構 〒305-0047 茨城県つくば市千現1-2-1",
      emailLabel: "メール",
      email: "DA.Bo@nims.go.jp",
      fieldsLabel: "研究分野",
      fields: [
        "半導体装置",
        "半導体装置材料",
        "エッチング装置材料",
        "電子ビーム装置材料",
        "電子ビーム計測アルゴリズム",
        "電子ビームと材料の相互作用",
      ],
    },
    sections: {
      industryIntro: {
        title: "背景紹介",
        content: "半導体産業は、情報通信、高性能計算、自動車電子、エネルギー分野などを支えるグローバルな基盤産業である。本産業は高度な国際分業体制のもとで成り立っており、設計、製造、パッケージングおよびテストなどの各工程において、地域間の緊密な連携が不可欠である。半導体製造は典型的な「装置駆動型」産業であり、その生産能力および技術レベルは、採用される製造装置に大きく依存する。\n\n先端プロセスがより微細な寸法および高集積化へと進展する中で、装置構造ならびに光学・回路設計は徐々に技術的限界に近づきつつあり、単純なアーキテクチャ最適化のみによる性能向上の余地は縮小している。このような状況下において、電子源、光学・電子光学部材、高耐環境構造材料といった重要材料が、次世代半導体装置の発展を支える重要なブレークスルーの方向性として位置付けられている。\n\nこのような背景のもと、[ラムリサーチ（Lam Research）](https://www.lamresearch.com/)と日本国立研究開発法人[物質・材料研究機構（National Institute for Materials Science, NIMS）](https://www.nims.go.jp/)は、半導体製造システムにおける高性能材料を対象とした長期的な共同研究を推進している。本研究では、極端環境下における材料特性およびその応用に関する課題に重点を置き、継続的な研究の深化を図るものである。また、本研究は、[NIMS](https://www.nims.go.jp/)の主任研究員である達 博博士が主導して推進している。\n\n本共同研究を基盤として、半導体装置用材料分野における学術交流および協働研究の強化を目的とする。一方では、学術訪問、共同研究、専門講演などを通じて、研究者が半導体装置企業における材料ニーズへの理解を深めることを促進する。他方では、情報発信および研究成果の共有を通じて、産業界における研究進展の認知を高め、産業ニーズと研究開発の方向性との効果的な連携を推進する。\n\n[ラムリサーチ（Lam Research）](https://www.lamresearch.com/)は、半導体製造装置分野におけるグローバルリーディング企業であり、世界各国の研究機関との科学研究支援および協業に長年取り組んできており、半導体製造に関わる重要技術の発展と革新を推進している。\n\n[物質・材料研究機構（NIMS）](https://www.nims.go.jp/)は、日本を代表する国立研究機関の一つであり、材料科学分野における体系的な基礎研究および応用研究を展開するとともに、国内外の大学および産業界と幅広い連携を行っている。"
      },
      projectNews: {
        title: "ニュース",
        featured: [
          {
            id: 1,
            title: "NIMSとラムリサーチが戦略的パートナーシップを発表",
            date: "2026-02-15",
            image: "",
            description: "半導体装置材料研究を推進する重要な協力関係"
          },
          {
            id: 2,
            title: "高性能材料開発でブレークスルー",
            date: "2026-02-10",
            image: "",
            description: "新しい電子源材料が初期テストで有望な結果を示す"
          },
          {
            id: 3,
            title: "国際研究交流プログラムを開始",
            date: "2026-02-05",
            image: "",
            description: "日本全国の材料研究者をNIMSでの共同研究に招待"
          }
        ],
        list: [
          { title: "第1回共同研究セミナーを成功裏に開催", date: "02-09" },
          { title: "プロジェクトチームがラムリサーチ本社を訪問", date: "02-06" },
          { title: "新しい研究施設が開設", date: "02-01" },
          { title: "研究成果が主要学術誌に掲載", date: "01-28" },
          { title: "産学フォーラムを3月に開催予定", date: "01-25" }
        ]
      },
      shortBioTitle: "ショートバイオ",
      shortBio:
        "あなたの名前は理論物理と半導体研究を専門とする助教で、量子理論、材料モデリング、デバイス応用を横断する研究を行っています。",
      longBioTitle: "詳細バイオ",
      longBio: [
        "あなたの名前は○○大学で物理学の博士号を取得し、凝縮系理論のポスドク研究を経て 2022 年に理論物理研究所に着任しました。現在は量子デバイスと低次元材料に焦点を当てた半導体研究グループを率いています。",
        "研究では第一原理計算、輸送理論、デバイスシミュレーションを統合し、新規半導体系における電荷・スピン・熱輸送の理解を進めています。",
      ],
      personalIntroTitle: "プロジェクトリーダー",
      personalProfile: {
        title: "個人プロフィール",
        content:
          "達博博士は現在、[国立研究開発法人物質・材料研究機構（NIMS）](https://www.nims.go.jp)の主任研究員です。",
      },
      mainResearchAreas: {
        title: "主要研究分野",
        content:
          "達博博士の研究は、計算物理学、材料物理学、先端材料評価に集中しており、主要な研究分野は以下の通りです：\n\n**1. ナノ材料の表面分析：** 基板支持ナノ材料の信号抽出の課題を解決し、材料の本質的な情報を取得する新しい手法の開発に専念しています。\n\n**2. 電子顕微鏡学と電子ビーム理論：** 荷電粒子と材料の相互作用、低エネルギー電子輸送特性、電子ビーム装置の設計原理を研究しています。\n\n**3. 材料情報学とAI計測：** 機械学習アルゴリズムを従来の測定機器に適用し、複雑な背景から微弱な信号を抽出し、測定精度と効率を向上させています。",
      },
      researchContent: {
        title: "研究内容",
        keywords: ["ナノ材料", "表面分析", "バックグラウンド信号", "二次電子"],
        description:
          "達博博士は、電子顕微鏡アルゴリズム、ソフトウェア開発、実験検証において革命的なブレークスルーを達成しました。主な研究成果は以下の通りです：\n\n**1. 仮想基板法とバックグラウンド信号分析：** 従来の反射モードでナノ材料信号が基板信号に隠れる問題に対し、達博博士は「四探針法」と赤外天文学の「チョップ・ノッド法」に着想を得て「仮想基板法」を提案しました。この方法は表面分析の新しいベンチマークを確立し、基板干渉を除去し、二次電子スペクトルからナノ材料の「自立」情報を抽出します。これにより、エネルギーフィルタリング走査電子顕微鏡（EF-SEM）を通じてナノ材料の電子-電子相互作用の定量的検出が可能になりました。\n\n**2. ヒューリスティックデータ駆動型スペクトル分析：** 人工知能技術を微弱信号測定に導入し、機械学習ベースの分析アルゴリズムを開発しました。この方法は半導体材料検出の信号対雑音比を大幅に向上させただけでなく、ラマン分光法による非侵襲的血糖検出技術への応用など、分野横断的な応用を実現しました。\n\n**3. 電子ポアソンスポットと新型「回転結晶」材料：** 基礎物理実験において、達博博士は電子における「ポアソンスポット」現象を初めて予測・発見し、次世代並列電子ビームリソグラフィ技術の理論的基盤を提供しました。この過程で、準結晶と結晶の中間に位置する軸対称「回転結晶材料」を発見し、この発見はノーベル賞の可能性を持つ画期的な研究と評価されています。",
        detailedDescription:
          "バルクまたは薄膜の固体材料に利用可能な特性評価技術は、基板支持ナノ材料に拡張されていますが、一般的に非定量的です。これは、一般的な反射構成技術では、ナノ材料信号が必然的に下層基板からの信号に埋もれるためです。ここでは、抵抗測定のための 4 点プローブ技術および赤外天文学の chop-nod 法に触発された仮想基板法を提案し、4 つの相互関連する測定から下層基板信号の影響を受けずにナノ材料を特性評価します。二次電子（SE）顕微鏡におけるこの方法では、2 つの異なる基板間の反射率の差に関連する SE スペクトル（白電子）を追跡および制御できます。SE スペクトルは、従来のコアレベル電子に匹敵する高効率で、ナノ材料の透過の微妙な変化に基づいて被覆ナノ材料を定量的に調査するために使用されます。仮想基板法は、支持ナノ材料に関する「独立」情報を提供する表面分析のベンチマークを表します。",
      },
      experience: {
        title: "経歴",
        items: [
          { year: "2019年4月 – 現在", institution: "[国立研究開発法人物質・材料研究機構（NIMS）](https://www.nims.go.jp)", position: "主任研究員" },
          { year: "2016年12月 – 2019年4月", institution: "[国立研究開発法人物質・材料研究機構（NIMS）](https://www.nims.go.jp)", position: "研究員" },
          { year: "2015年1月 – 2016年12月", institution: "[国立研究開発法人物質・材料研究機構（NIMS）](https://www.nims.go.jp)", position: "ICYS研究員" },
          { year: "2013年11月 – 2015年1月", institution: "[国立研究開発法人物質・材料研究機構（NIMS）](https://www.nims.go.jp)", position: "ポスドク研究員" },
          { year: "2008年9月 – 2013年6月", institution: "[中国科学技術大学](https://www.ustc.edu.cn)", position: "理学博士（物理学）" },
          { year: "2004年9月 – 2008年6月", institution: "[中国科学技術大学](https://www.ustc.edu.cn)", position: "理学学士（物理学）" },
        ],
      },
      academicPositions: {
        title: "受賞歴・社会貢献",
        items: [
          "日本表面真空学会 渉外・交渉部担当",
          "日本モンテカルロ法協会 理事長",
          "清水賞 選考委員長",
          "日本博士協会 材料部門副会長",
          "中国科学技術大学日本同窓会 科研所分会長",
          "NIMS公式スローガン制定者：「材料が世界を変える、我々が材料を創る」",
        ],
      },
      projectsTitle: "プロジェクト／コンサルティング",
      projects: [
        "量子支援半導体デバイス国家プロジェクト",
        "ワイドバンドギャップ材料の信頼性評価",
        "ナノスケール熱輸送の学際的研究",
      ],
      conferencesTitle: "会議・メディア",
      conferences: [
        "APS March Meeting、MRS での招待講演",
        "ナノデバイスモデリング会議での基調講演",
        "大学研究ニュースおよび科学メディアに掲載",
      ],
    },
    common: {
      backToList: "リストに戻る",
      noData: "データがありません",
      loading: "読み込み中...",
      authorBio: "著者紹介",
      abstract: "講演概要",
      speakerLabel: "講演者：",
      institutionLabel: "所属機関：",
      dateLabel: "日時：",
    },
    navigation: {
      overview: "概要",
      bio: "バイオ",
      projects: "プロジェクト",
      media: "メディア",
      contact: "連絡先",
      home: "ホーム",
      forum: "招待講演",
      achievements: "ニュース",
      papers: "共同論文",
    },
    papers: {
      title: "共同論文",
      description: "発表された研究論文と出版物の包括的なリスト。",
      previous: "前へ",
      next: "次へ",
      pageInfo: "ページ {current} / {total}",
      noResults: "論文が見つかりません。",
      showing: "表示中",
      to: "-",
      of: "件中",
      items: "件",
      sponsorLabel: "スポンサー企業",
    },
    forum: {
      title: "招待講演",
      inviterIntro: {
        title: "プロジェクト紹介",
        content: "本プロジェクトでは、半導体製造システムにおけるキーマテリアルに関する課題を対象として、定期的に学術講演および交流活動を実施する。これらの活動は、材料科学、電子光学、半導体装置分野に焦点を当て、分野横断的な研究者間の学術交流を促進するとともに、研究開発の方向性と実際の産業ニーズとの連携強化を図るものである。\n\n本講演シリーズは、プロジェクトにおける連携・交流体制の一環として継続的に実施する。"
      },
      host: "司会者",
      speaker: "講演者",
      date: "開催日",
      viewDetails: "詳細を見る",
      introduction: "紹介",
      backToList: "フォーラムリストに戻る",
      noInvitations: "招待講演はありません",
    },
    achievements: {
      mediaReports: {
        title: "ニュースコラム",
        readMore: "詳しく見る",
        items: [
          {
            image: "/media-report-1.png",
            title: "半導体製造装置にブレークスルー：世界初の結晶体で電子ビームを精密制御",
            content: "NIMS主任研究員・達博博士へのインタビュー。横浜のTNPパートナーズがサポートする、世界初の結晶体を用いた電子ビーム精密制御技術の革新的開発について詳述。",
            date: "2025年4月",
            journals: ["地域経済情報"],
          },
          {
            images: [
              { src: "/media-report-2c.png", alt: "低速電子走行距離を正確計算（科学新聞）" },
              { src: "/media-report-2b.png", alt: "電子の走行距離を正確計算（日刊工業新聞）" },
              { src: "/media-report-2a.png", alt: "NIMSが新アルゴリズム（日刊産業新聞）" },
              { src: "/media-report-2d.png", alt: "低粘度電子走行距離アルゴリズム（NIMSニュース）" }
            ],
            title: "高精度な電子・固体相互作用モデル",
            content: "電子走行距離を精密に計算するための達博博士のアルゴリズムが主要な科学メディアで特集され、表面分析における画期的な進展として紹介されました。",
            date: "2014年8月/9月",
            journals: ["化学工業日報", "日刊工業新聞", "日刊産業新聞", "NIMS News"],
          },
          {
            image: "/media-report-3.png",
            title: "表面分析の革新で総裁賞を受賞",
            content: "NIMS が材料科学分野での卓越した貢献を表彰し、画期的な表面分析測定技術に対して最高の栄誉（NIMS 総裁賞）を授与しました。",
            date: "2020年9月",
            journals: ["NIMS News"],
          },
        ],
      },
      awards: {
        title: "受賞歴",
        items: [
          { year: "2023年", name: "倉田奨励金 -- 日本日立財団" },
          { year: "2023年", name: "池谷財団研究助成金 -- 日本池谷科学技術振興財団" },
          { year: "2020年", name: "花王科学奨励金 -- 日本花王財団" },
          { year: "2019年", name: "優秀発表賞 -- 日本国立材料研究所 NIMS WEEK 組織委員会" },
          { year: "2018年", name: "優秀発表賞 -- 日本材料統合と先進材料キャラクタリゼーション合同シンポジウム実行委員会" },
          { year: "2017年", name: "理事長進歩賞 -- 日本国立材料研究所理事会" },
          { year: "2016年", name: "優秀発表賞 -- 日本多分野測定合同シンポジウム実行委員会" },
        ],
      },
      noNewsColumns: "ニュースコラムはありません",
    },
  },
} as const satisfies Record<Locale, unknown>;
