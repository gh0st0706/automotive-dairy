export const defaultData = {
  vehicles: [
    {
      id: "maruti-800",
      name: "Maruti Suzuki 800",
      vehicle: {
        name: "Maruti Suzuki 800",
        engine: "F8B inline 3, carburetted",
        variant: "Type 2",
        transmission: "Manual (verify exact spec)",
        odometer: "To record",
        nextServiceDue: "2026-10-15",
        tyres: "To record current size, brand, tread, and pressure",
        notes:
          "Engineering diary and component encyclopedia for the Maruti 800.",
      },
      futurePlans: [
        "Rebuild carburettor and verify fuel delivery behaviour",
        "Inspect ignition timing and distributor condition",
        "Document cooling system performance and thermostat operation",
        "Capture all component photographs with labels",
      ],
      diaryEntries: [
        {
          id: 1,
          date: "2026-09-10",
          title: "Project setup",
          category: "Diary",
          summary:
            "Initialized the automotive diary app and organized the GLB assets.",
          details:
            "Preserved source model files and created working copies for future modelling and component labelling.",
        },
        {
          id: 2,
          date: "2026-09-10",
          title: "Power flow milestone",
          category: "Engineering study",
          summary:
            "Defined the first major subsystem path from tank to wheels.",
          details:
            "The plan is to record fuel, combustion, drivetrain, and wheel delivery relationships in a structured way.",
        },
      ],
      modelUrl: "/models/maruti_800_ac.glb",
    },
    {
      id: "ignis",
      name: "Suzuki Ignis",
      vehicle: {
        name: "Suzuki Ignis",
        engine: "K-Series petrol",
        variant: "2022 reference",
        transmission: "Manual / Automatic (verify exact spec)",
        odometer: "To record",
        nextServiceDue: "2026-11-01",
        tyres: "To record current size, brand, tread, and pressure",
        notes: "Reference vehicle for comparison, benchmarking, and learning.",
      },
      futurePlans: [
        "Compare steering and suspension layout to the Maruti 800",
        "Document drive-by-wire and safety differences",
        "Capture the chassis and comfort improvements",
      ],
      diaryEntries: [
        {
          id: 1,
          date: "2026-09-10",
          title: "Reference study started",
          category: "Engineering study",
          summary:
            "Added the Ignis as a comparison vehicle alongside the Maruti 800.",
          details:
            "This gives the diary a second vehicle entry for benchmarking and component comparison work.",
        },
      ],
      modelUrl: "/models/2022_suzuki_ignis.glb",
    },
  ],
};
