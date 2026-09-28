/**
 * Wonder Dash: Magic World - 3D Procedural Cartoon Mesh Builders
 * Built with Three.js for optimal 60fps mobile performance and ultra-rich aesthetics.
 * Zero external copyright assets - 100% Original Models!
 */

const WonderModels = {
  // Reusable Materials & Colors Cache for high performance and low draw calls
  materialsCache: {},

  getMaterial(key, createFn) {
    if (!this.materialsCache[key]) {
      this.materialsCache[key] = createFn();
    }
    return this.materialsCache[key];
  },

  // ----------------------------------------------------
  // CHARACTER BUILDERS (Articulated Rig with Vibrant Cartoon Materials)
  // ----------------------------------------------------

  createCharacter(characterId = "milo", skinId = "classic") {
    const group = new THREE.Group();
    group.name = `character_${characterId}_${skinId}`;

    const charConfig = WONDER_CONFIG.CHARACTERS.find(c => c.id === characterId) || WONDER_CONFIG.CHARACTERS[0];
    
    // Saturated, vibrant cartoon palettes with glossy finish
    let baseColor = charConfig.baseColor;
    let secColor = charConfig.secondaryColor;
    let accColor = charConfig.accentColor;

    if (skinId === "golden_pilot" || skinId === "golden_bamboo" || skinId === "milo_golden") {
      baseColor = "#f59e0b";
      secColor = "#fbbf24";
      accColor = "#ffffff";
    } else if (skinId === "cosmic_mage" || skinId === "cyber_neon") {
      baseColor = "#00f0ff";
      secColor = "#8b5cf6";
      accColor = "#f43f5e";
    } else if (skinId === "ruby_drake") {
      baseColor = "#ef4444";
      secColor = "#f97316";
      accColor = "#fbbf24";
    } else if (skinId === "zen_master") {
      baseColor = "#059669";
      secColor = "#ffffff";
      accColor = "#fbbf24";
    }

    // High-vibrancy glossy materials with subtle emissive cartoon glow
    const baseCol = new THREE.Color(baseColor);
    const secCol = new THREE.Color(secColor);
    const accCol = new THREE.Color(accColor);

    const matBase = new THREE.MeshStandardMaterial({
      color: baseCol,
      emissive: baseCol.clone().multiplyScalar(0.2),
      roughness: 0.28,
      metalness: 0.12
    });

    const matSec = new THREE.MeshStandardMaterial({
      color: secCol,
      emissive: secCol.clone().multiplyScalar(0.2),
      roughness: 0.32,
      metalness: 0.08
    });

    const matAcc = new THREE.MeshStandardMaterial({
      color: accCol,
      emissive: accCol.clone().multiplyScalar(0.25),
      roughness: 0.25,
      metalness: 0.2
    });

    const matDark = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.4,
      metalness: 0.2
    });

    const matEyeWhite = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      emissive: 0x333333,
      roughness: 0.1,
      metalness: 0.0
    });

    const matEyePupil = new THREE.MeshBasicMaterial({ color: 0x09090b });
    const matGold = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      emissive: 0xd97706,
      emissiveIntensity: 0.35,
      metalness: 0.85,
      roughness: 0.15
    });

    // Pivot containers for dynamic 60fps animations
    const bodyPivot = new THREE.Group();
    const headPivot = new THREE.Group();
    const leftLeg = new THREE.Group();
    const rightLeg = new THREE.Group();
    const leftArm = new THREE.Group();
    const rightArm = new THREE.Group();
    const tailPivot = new THREE.Group();
    const wingsPivot = new THREE.Group();
    const scarfPivot = new THREE.Group();
    const capePivot = new THREE.Group();

    // 1. TORSO (Curved Chubby Cartoon Body)
    const torsoGeo = new THREE.CylinderGeometry(0.36, 0.44, 0.76, 16);
    const torsoMesh = new THREE.Mesh(torsoGeo, matBase);
    torsoMesh.position.y = 0.65;
    torsoMesh.castShadow = true;
    bodyPivot.add(torsoMesh);

    // Fluffy Belly Patch
    const chestGeo = new THREE.CylinderGeometry(0.37, 0.42, 0.48, 16, 1, false, 0, Math.PI);
    const chestMesh = new THREE.Mesh(chestGeo, matSec);
    chestMesh.position.set(0, 0.65, 0.06);
    chestMesh.rotation.y = Math.PI / 2;
    bodyPivot.add(chestMesh);

    // 2. HEAD & FACIAL EXPRESSIONS
    headPivot.position.set(0, 1.15, 0.05);
    const headGeo = new THREE.SphereGeometry(0.46, 20, 20);
    const headMesh = new THREE.Mesh(headGeo, matBase);
    headMesh.castShadow = true;
    headPivot.add(headMesh);

    // Muzzle / Snout
    const muzzleGeo = new THREE.CylinderGeometry(0.14, 0.24, 0.28, 16);
    const muzzleMesh = new THREE.Mesh(muzzleGeo, matSec);
    muzzleMesh.position.set(0, -0.08, 0.36);
    muzzleMesh.rotation.x = Math.PI / 2;
    headPivot.add(muzzleMesh);

    // Cute Shiny Nose
    const noseGeo = new THREE.SphereGeometry(0.07, 10, 10);
    const noseMesh = new THREE.Mesh(noseGeo, matDark);
    noseMesh.position.set(0, -0.04, 0.50);
    headPivot.add(noseMesh);

    // Large Expressive Eyes with Glossy Highlights
    [-0.17, 0.17].forEach(x => {
      const eyeWhite = new THREE.Mesh(new THREE.SphereGeometry(0.11, 14, 14), matEyeWhite);
      eyeWhite.scale.set(1, 1.3, 0.4);
      eyeWhite.position.set(x, 0.09, 0.38);
      headPivot.add(eyeWhite);

      // Pupil color per character
      let pupilColor = 0x0284c7; // Milo blue eyes
      if (characterId === "luna") pupilColor = 0xf59e0b; // Luna golden eyes
      if (characterId === "pip") pupilColor = 0x10b981; // Pip emerald eyes
      if (characterId === "coco") pupilColor = 0x475569; // Coco dark eyes
      if (characterId === "nova") pupilColor = 0xec4899; // Nova magenta eyes

      const eyeIris = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 12, 12),
        new THREE.MeshBasicMaterial({ color: pupilColor })
      );
      eyeIris.scale.set(1, 1.25, 0.3);
      eyeIris.position.set(x * 1.02, 0.09, 0.42);
      headPivot.add(eyeIris);

      const eyePupil = new THREE.Mesh(new THREE.SphereGeometry(0.045, 10, 10), matEyePupil);
      eyePupil.scale.set(1, 1.2, 0.3);
      eyePupil.position.set(x * 1.02, 0.09, 0.44);
      headPivot.add(eyePupil);

      // Cute Sparkling Catchlights
      const sparkle1 = new THREE.Mesh(new THREE.SphereGeometry(0.024, 8, 8), matEyeWhite);
      sparkle1.position.set(x + (x > 0 ? 0.025 : -0.025), 0.12, 0.46);
      headPivot.add(sparkle1);

      const sparkle2 = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 6), matEyeWhite);
      sparkle2.position.set(x - (x > 0 ? 0.015 : -0.015), 0.06, 0.46);
      headPivot.add(sparkle2);

      // Cute Rosy Cheeks
      const cheek = new THREE.Mesh(
        new THREE.SphereGeometry(0.08, 8, 8),
        new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.5, emissive: 0xf43f5e, emissiveIntensity: 0.3 })
      );
      cheek.scale.set(1.2, 0.6, 0.2);
      cheek.position.set(x * 1.8, -0.1, 0.35);
      headPivot.add(cheek);
    });

    // 3. CHARACTER UNIQUE TRAITS & COSTUMES
    if (characterId === "leo") {
      // Leo: Star Wizard Apprentice - Royal Purple Drooping Wizard Hat with Golden Tiara Crest,
      // Amethyst Gem, Flowing Coral Ribbon Scarf, Cobalt Blue Jumpsuit, and Starlight Sneakers
      
      // 1. TUNIC ACCESSORIES: Purple Belt & Shiny Gold Chest Buttons
      const matBelt = new THREE.MeshStandardMaterial({ color: 0x9333ea, roughness: 0.3 });
      const beltMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.12, 16), matBelt);
      beltMesh.position.set(0, 0.48, 0);
      bodyPivot.add(beltMesh);

      const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.12, 0.06), matGold);
      buckleMesh.position.set(0, 0.48, 0.42);
      bodyPivot.add(buckleMesh);

      // Gold Chest Buttons
      [0.62, 0.76].forEach(y => {
        const btn = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), matGold);
        btn.position.set(0, y, 0.42);
        bodyPivot.add(btn);
      });

      // 2. HEAD: Peach Cartoon Skin & Dark Chocolate Anime Hair
      const matSkin = new THREE.MeshStandardMaterial({
        color: 0xffd8be,
        roughness: 0.35,
        emissive: 0xffd8be,
        emissiveIntensity: 0.12
      });
      const matHair = new THREE.MeshStandardMaterial({
        color: 0x451a03,
        roughness: 0.38,
        emissive: 0x271202,
        emissiveIntensity: 0.18
      });

      headMesh.material = matSkin;
      muzzleMesh.visible = false; // Hide animal snout for human hero
      noseMesh.position.set(0, -0.02, 0.46);
      noseMesh.scale.set(0.6, 0.6, 0.6);
      noseMesh.material = new THREE.MeshStandardMaterial({ color: 0xffa07a, roughness: 0.5 });

      // Joyful anime smile
      const mouthGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.04, 12, 1, false, 0, Math.PI);
      const mouthMat = new THREE.MeshBasicMaterial({ color: 0x881337 });
      const mouth = new THREE.Mesh(mouthGeo, mouthMat);
      mouth.position.set(0, -0.16, 0.44);
      mouth.rotation.x = Math.PI / 2;
      headPivot.add(mouth);

      const tooth = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.03, 0.02), matEyeWhite);
      tooth.position.set(0, -0.13, 0.46);
      headPivot.add(tooth);

      // Cute Peach Round Ears
      [-0.42, 0.42].forEach(x => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 10), matSkin);
        ear.scale.set(0.4, 0.9, 0.7);
        ear.position.set(x, 0.04, 0);
        ear.rotation.y = x > 0 ? 0.2 : -0.2;
        headPivot.add(ear);
      });

      // Anime Hair Bangs / Fringe
      const bangsGroup = new THREE.Group();
      [-0.24, -0.12, 0, 0.12, 0.24].forEach((x, i) => {
        const strand = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.32, 8), matHair);
        strand.position.set(x, 0.22, 0.4 - Math.abs(x) * 0.1);
        strand.rotation.set(0.35, 0, (i - 2) * -0.18);
        bangsGroup.add(strand);
      });
      headPivot.add(bangsGroup);

      // Back Hair Tufts
      const backHair = new THREE.Mesh(new THREE.SphereGeometry(0.47, 14, 14, 0, Math.PI * 2, Math.PI * 0.4, Math.PI * 0.6), matHair);
      backHair.position.set(0, 0, -0.05);
      headPivot.add(backHair);

      // 3. ROYAL VIOLET WIZARD HAT & GOLDEN TIARA CROWN
      const matWizardHat = new THREE.MeshStandardMaterial({
        color: (skinId === "celestial_prince") ? 0xf59e0b : ((skinId === "shadow_alchemist") ? 0x1e1b4b : 0x7c3aed),
        emissive: (skinId === "celestial_prince") ? 0xd97706 : ((skinId === "shadow_alchemist") ? 0x4c1d95 : 0x6d28d9),
        emissiveIntensity: 0.35,
        roughness: 0.28,
        metalness: 0.1
      });

      // Hat Brim / Visor
      const brim = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.64, 0.08, 20), matWizardHat);
      brim.position.set(0, 0.36, 0.05);
      brim.rotation.x = -0.12;
      headPivot.add(brim);

      // Main Hat Cone curving backwards
      const hatMain = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.56, 0.55, 18), matWizardHat);
      hatMain.position.set(0, 0.62, -0.02);
      hatMain.rotation.x = -0.25;
      headPivot.add(hatMain);

      const hatCurve = new THREE.Mesh(new THREE.ConeGeometry(0.36, 0.65, 16), matWizardHat);
      hatCurve.position.set(0, 0.95, -0.26);
      hatCurve.rotation.x = -0.85;
      headPivot.add(hatCurve);

      // Hat Tip with Golden Bauble & Amethyst Pompom
      const hatTip = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), matGold);
      hatTip.position.set(0, 0.85, -0.62);
      headPivot.add(hatTip);

      const hatGem = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.08),
        new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xc084fc, emissiveIntensity: 0.9 })
      );
      hatGem.position.set(0, 0.72, -0.68);
      headPivot.add(hatGem);

      // Golden Crown Tiara on Front of Hat
      const tiaraBase = new THREE.Mesh(new THREE.CylinderGeometry(0.52, 0.54, 0.14, 20, 1, true, 0, Math.PI), matGold);
      tiaraBase.position.set(0, 0.44, 0.12);
      tiaraBase.rotation.set(-0.15, Math.PI / 2, 0);
      headPivot.add(tiaraBase);

      const tiaraCrest = new THREE.Mesh(new THREE.ConeGeometry(0.14, 0.28, 5), matGold);
      tiaraCrest.position.set(0, 0.62, 0.38);
      tiaraCrest.rotation.x = -0.15;
      headPivot.add(tiaraCrest);

      // Inlaid Glowing Amethyst Jewel
      const tiaraJewel = new THREE.Mesh(
        new THREE.SphereGeometry(0.075, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xd946ef, emissive: 0xd946ef, emissiveIntensity: 0.85, roughness: 0.1 })
      );
      tiaraJewel.position.set(0, 0.56, 0.46);
      headPivot.add(tiaraJewel);

      // 4. FLOWING CORAL-ORANGE MAGICAL SCARF
      scarfPivot.position.set(0, 0.98, 0.05);
      const scarfMat = new THREE.MeshStandardMaterial({
        color: 0xff7875,
        emissive: 0xf97316,
        emissiveIntensity: 0.55,
        roughness: 0.35
      });
      const scarfCollar = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 10, 20), scarfMat);
      scarfCollar.rotation.x = Math.PI / 2;
      scarfPivot.add(scarfCollar);

      // Fluttering Ribbon Tails
      [-0.14, 0.14].forEach((x, i) => {
        const ribbon = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.65, 0.04), scarfMat);
        ribbon.position.set(x * 1.5, -0.28, -0.28);
        ribbon.rotation.set(0.65, x * 0.8, (i === 0 ? -0.2 : 0.2));
        scarfPivot.add(ribbon);
      });
      bodyPivot.add(scarfPivot);

    } else if (characterId === "milo") {
      // Milo: Fox Ears & Golden Aviator Goggles & Flowing Red Scarf
      [-0.25, 0.25].forEach(x => {
        const earGeo = new THREE.ConeGeometry(0.19, 0.42, 10);
        const earMesh = new THREE.Mesh(earGeo, matBase);
        earMesh.position.set(x, 0.46, -0.05);
        earMesh.rotation.z = x > 0 ? -0.32 : 0.32;
        headPivot.add(earMesh);

        const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.28, 10), matSec);
        earInner.position.set(x, 0.45, -0.01);
        earInner.rotation.z = x > 0 ? -0.32 : 0.32;
        headPivot.add(earInner);
      });

      // Aviator Goggles on forehead
      const goggleFrame = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.045, 10, 20), matGold);
      goggleFrame.position.set(0, 0.24, 0.1);
      goggleFrame.rotation.x = 0.42;
      headPivot.add(goggleFrame);

      [-0.14, 0.14].forEach(x => {
        const lensMat = new THREE.MeshStandardMaterial({
          color: 0x06b6d4,
          emissive: 0x0891b2,
          emissiveIntensity: 0.5,
          roughness: 0.1,
          metalness: 0.6
        });
        const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.06, 14), lensMat);
        lens.rotation.x = Math.PI / 2;
        lens.position.set(x, 0.26, 0.38);
        headPivot.add(lens);
      });

      // Flowing Ruby Scarf
      scarfPivot.position.set(0, 0.98, 0.05);
      const scarfMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        emissive: 0xb91c1c,
        emissiveIntensity: 0.3,
        roughness: 0.4
      });
      const scarf = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.09, 10, 20), scarfMat);
      scarf.rotation.x = Math.PI / 2;
      scarfPivot.add(scarf);

      const scarfTail = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.5, 0.05), scarfMat);
      scarfTail.position.set(0.22, -0.22, -0.26);
      scarfTail.rotation.x = 0.55;
      scarfPivot.add(scarfTail);
      bodyPivot.add(scarfPivot);

      // Bushy Fox Tail
      const tailGeo = new THREE.ConeGeometry(0.26, 0.75, 12);
      const tailMesh = new THREE.Mesh(tailGeo, matBase);
      tailMesh.position.set(0, 0.3, -0.32);
      tailMesh.rotation.x = -1.15;
      tailPivot.add(tailMesh);

      const tailTip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.32, 12), matSec);
      tailTip.position.set(0, 0.58, -0.54);
      tailTip.rotation.x = -1.15;
      tailPivot.add(tailTip);

    } else if (characterId === "luna") {
      // Luna: Witch Cat Hat & Cape & Moon Talisman
      [-0.23, 0.23].forEach(x => {
        const ear = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.32, 10), matBase);
        ear.position.set(x, 0.44, 0);
        ear.rotation.z = x > 0 ? -0.28 : 0.28;
        headPivot.add(ear);

        const earIn = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), matAcc);
        earIn.position.set(x, 0.43, 0.04);
        earIn.rotation.z = x > 0 ? -0.28 : 0.28;
        headPivot.add(earIn);
      });

      // Wizard Witch Hat
      const hatBrim = new THREE.Mesh(new THREE.CylinderGeometry(0.58, 0.58, 0.06, 20), matDark);
      hatBrim.position.set(0, 0.42, 0);
      headPivot.add(hatBrim);

      const hatCone = new THREE.Mesh(new THREE.ConeGeometry(0.34, 0.65, 16), matDark);
      hatCone.position.set(0, 0.72, -0.05);
      hatCone.rotation.x = -0.15;
      headPivot.add(hatCone);

      const hatRibbon = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.36, 0.09, 16), matAcc);
      hatRibbon.position.set(0, 0.48, -0.02);
      headPivot.add(hatRibbon);

      // Crescent Moon Crest on Hat
      const moon = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 16, Math.PI * 1.3), matGold);
      moon.position.set(0, 0.52, 0.34);
      headPivot.add(moon);

      // Star Sorceress Cape
      capePivot.position.set(0, 0.95, -0.2);
      const cape = new THREE.Mesh(new THREE.BoxGeometry(0.65, 0.75, 0.05), matBase);
      cape.position.set(0, -0.35, 0);
      cape.rotation.x = 0.2;
      capePivot.add(cape);
      bodyPivot.add(capePivot);

      // Slender Cat Tail
      const catTail = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.65, 10), matBase);
      catTail.position.set(0, 0.25, -0.32);
      catTail.rotation.x = -0.8;
      tailPivot.add(catTail);

    } else if (characterId === "pip") {
      // Pip: Turquoise Baby Dragon with Flutter Wings & Horns
      [-0.18, 0.18].forEach(x => {
        const hornGeo = new THREE.ConeGeometry(0.09, 0.34, 10);
        const horn = new THREE.Mesh(hornGeo, matAcc);
        horn.position.set(x, 0.48, -0.1);
        horn.rotation.set(-0.3, 0, x > 0 ? -0.35 : 0.35);
        headPivot.add(horn);
      });

      // Dragon Flutter Wings
      wingsPivot.position.set(0, 0.75, -0.22);
      [-0.32, 0.32].forEach(x => {
        const wingMat = new THREE.MeshStandardMaterial({
          color: 0xff6b6b,
          emissive: 0xf43f5e,
          emissiveIntensity: 0.4,
          roughness: 0.3,
          side: THREE.DoubleSide
        });
        const wingGeo = new THREE.BufferGeometry();
        const vertices = new Float32Array([
          0, 0, 0,
          x * 1.6, 0.5, -0.2,
          x * 1.2, -0.4, -0.1
        ]);
        wingGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        wingGeo.computeVertexNormals();
        const wing = new THREE.Mesh(wingGeo, wingMat);
        wingsPivot.add(wing);
      });
      bodyPivot.add(wingsPivot);

      // Spiked Dragon Tail
      const dragTail = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.65, 10), matBase);
      dragTail.position.set(0, 0.2, -0.32);
      dragTail.rotation.x = -1.2;
      tailPivot.add(dragTail);

      const tailFin = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.22, 6), matAcc);
      tailFin.position.set(0, 0.45, -0.5);
      tailFin.rotation.x = -1.2;
      tailPivot.add(tailFin);

    } else if (characterId === "coco") {
      // Coco: Cheerful Panda with Green Vest & Bamboo Backpack
      [-0.26, 0.26].forEach(x => {
        const ear = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 12), matDark);
        ear.position.set(x, 0.38, 0);
        headPivot.add(ear);

        // Panda Eye Patches
        const patch = new THREE.Mesh(new THREE.SphereGeometry(0.14, 10, 10), matDark);
        patch.scale.set(1.1, 1.4, 0.3);
        patch.position.set(x * 0.7, 0.08, 0.35);
        patch.rotation.z = x > 0 ? -0.25 : 0.25;
        headPivot.add(patch);
      });

      // Explorer Vest
      const vestMat = new THREE.MeshStandardMaterial({
        color: 0x10b981,
        emissive: 0x059669,
        emissiveIntensity: 0.25,
        roughness: 0.3
      });
      const vest = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.46, 0.48, 16), vestMat);
      vest.position.set(0, 0.65, 0);
      bodyPivot.add(vest);

      // Bamboo Backpack on back
      const packMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xd97706,
        emissiveIntensity: 0.3,
        roughness: 0.35
      });
      const pack = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.55, 0.26), packMat);
      pack.position.set(0, 0.68, -0.32);
      bodyPivot.add(pack);

      const bambooShoot = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.6, 8), vestMat);
      bambooShoot.position.set(0.12, 0.95, -0.32);
      bambooShoot.rotation.z = -0.2;
      bodyPivot.add(bambooShoot);

      // Panda Stubby Tail
      const pTail = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), matDark);
      pTail.position.set(0, 0.28, -0.36);
      tailPivot.add(pTail);

    } else if (characterId === "nova") {
      // Nova: Cosmic Space Bunny with Glowing Astronaut Visor & Anti-Gravity Ears
      [-0.18, 0.18].forEach(x => {
        const bEar = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 0.65, 10), matBase);
        bEar.position.set(x, 0.62, -0.05);
        bEar.rotation.z = x > 0 ? -0.22 : 0.22;
        headPivot.add(bEar);

        const bTip = new THREE.Mesh(new THREE.SphereGeometry(0.09, 8, 8), matAcc);
        bTip.position.set(x * 1.5, 0.94, -0.05);
        headPivot.add(bTip);
      });

      // Holographic Neon Astronaut Visor
      const visorMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 0.8,
        roughness: 0.05,
        metalness: 0.85
      });
      const visor = new THREE.Mesh(new THREE.SphereGeometry(0.48, 16, 16, 0, Math.PI, 0, Math.PI * 0.55), visorMat);
      visor.position.set(0, 0.05, 0.08);
      visor.rotation.x = Math.PI / 2;
      headPivot.add(visor);

      // Cyber Jetpack
      const jetMat = new THREE.MeshStandardMaterial({
        color: 0x8b5cf6,
        emissive: 0x6d28d9,
        emissiveIntensity: 0.4,
        roughness: 0.2,
        metalness: 0.6
      });
      [-0.18, 0.18].forEach(x => {
        const jet = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.55, 10), jetMat);
        jet.position.set(x, 0.65, -0.32);
        bodyPivot.add(jet);

        const thruster = new THREE.Mesh(
          new THREE.ConeGeometry(0.08, 0.22, 8),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        thruster.position.set(x, 0.32, -0.32);
        thruster.rotation.x = Math.PI;
        bodyPivot.add(thruster);
      });

      // Fluffy Bunny Tail
      const bTail = new THREE.Mesh(new THREE.SphereGeometry(0.12, 10, 10), matBase);
      bTail.position.set(0, 0.28, -0.36);
      tailPivot.add(bTail);
    }

    // 4. ARTICULATED LEGS & ARMS
    if (characterId === "leo") {
      // Specialized Starlight Wizard Running Sneakers
      const matSneakerBody = new THREE.MeshStandardMaterial({
        color: (skinId === "celestial_prince") ? 0xf59e0b : ((skinId === "shadow_alchemist") ? 0x1e1b4b : 0x7c3aed),
        emissive: (skinId === "celestial_prince") ? 0xd97706 : ((skinId === "shadow_alchemist") ? 0x4c1d95 : 0x5b21b6),
        emissiveIntensity: 0.35,
        roughness: 0.3
      });
      const matNeonSole = new THREE.MeshStandardMaterial({
        color: (skinId === "celestial_prince") ? 0x00f0ff : 0xf43f5e,
        emissive: (skinId === "celestial_prince") ? 0x00f0ff : 0xf43f5e,
        emissiveIntensity: 0.95,
        roughness: 0.1
      });
      const matSock = new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.4
      });
      const matCuff = new THREE.MeshStandardMaterial({
        color: (skinId === "celestial_prince") ? 0xfbbf24 : 0xf97316,
        roughness: 0.4
      });

      // Left Leg
      leftLeg.position.set(-0.2, 0.35, 0);
      const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 10), matBase);
      lLegMesh.position.y = -0.14;
      leftLeg.add(lLegMesh);

      // Orange cuff ring & White sock
      const lCuff = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 14), matCuff);
      lCuff.position.set(0, -0.22, 0);
      lCuff.rotation.x = Math.PI / 2;
      leftLeg.add(lCuff);

      const lSock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), matSock);
      lSock.position.set(0, -0.26, 0);
      leftLeg.add(lSock);

      // Sneaker upper
      const lSneaker = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), matSneakerBody);
      lSneaker.position.set(0, -0.32, 0.06);
      leftLeg.add(lSneaker);

      // Glowing Starlight Sole
      const lSole = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.34), matNeonSole);
      lSole.position.set(0, -0.39, 0.06);
      leftLeg.add(lSole);

      // Golden Star Buckle on outside of left shoe
      const lStar = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.04, 5), matGold);
      lStar.position.set(-0.12, -0.32, 0.06);
      lStar.rotation.z = Math.PI / 2;
      leftLeg.add(lStar);

      // Right Leg
      rightLeg.position.set(0.2, 0.35, 0);
      const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.32, 10), matBase);
      rLegMesh.position.y = -0.14;
      rightLeg.add(rLegMesh);

      const rCuff = new THREE.Mesh(new THREE.TorusGeometry(0.12, 0.035, 8, 14), matCuff);
      rCuff.position.set(0, -0.22, 0);
      rCuff.rotation.x = Math.PI / 2;
      rightLeg.add(rCuff);

      const rSock = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12), matSock);
      rSock.position.set(0, -0.26, 0);
      rightLeg.add(rSock);

      const rSneaker = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 0.32), matSneakerBody);
      rSneaker.position.set(0, -0.32, 0.06);
      rightLeg.add(rSneaker);

      const rSole = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.05, 0.34), matNeonSole);
      rSole.position.set(0, -0.39, 0.06);
      rightLeg.add(rSole);

      const rStar = new THREE.Mesh(new THREE.ConeGeometry(0.06, 0.04, 5), matGold);
      rStar.position.set(0.12, -0.32, 0.06);
      rStar.rotation.z = -Math.PI / 2;
      rightLeg.add(rStar);

      // Arms with white gloves and star magic wand
      leftArm.position.set(-0.42, 0.85, 0);
      const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 10), matBase);
      lArmMesh.position.y = -0.15;
      leftArm.add(lArmMesh);
      const lGlove = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), matSock);
      lGlove.position.set(0, -0.3, 0);
      leftArm.add(lGlove);

      rightArm.position.set(0.42, 0.85, 0);
      const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 10), matBase);
      rArmMesh.position.y = -0.15;
      rightArm.add(rArmMesh);
      const rGlove = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), matSock);
      rGlove.position.set(0, -0.3, 0);
      rightArm.add(rGlove);

      // Magic Wand in right hand
      const wandStick = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.025, 0.38, 8), matGold);
      wandStick.position.set(0.05, -0.28, 0.12);
      wandStick.rotation.x = 0.6;
      rightArm.add(wandStick);

      const wandStar = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.06, 5), matGold);
      wandStar.position.set(0.05, -0.14, 0.26);
      wandStar.rotation.x = 0.6;
      rightArm.add(wandStar);

    } else {
      const limbMat = (characterId === "coco") ? matDark : matBase;
      const footMat = (characterId === "coco") ? matDark : (characterId === "milo" ? matDark : matSec);

      // Left Leg
      leftLeg.position.set(-0.2, 0.35, 0);
      const lLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.35, 10), limbMat);
      lLegMesh.position.y = -0.15;
      leftLeg.add(lLegMesh);
      const lFoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.13, 0.28), footMat);
      lFoot.position.set(0, -0.3, 0.06);
      leftLeg.add(lFoot);

      // Right Leg
      rightLeg.position.set(0.2, 0.35, 0);
      const rLegMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.35, 10), limbMat);
      rLegMesh.position.y = -0.15;
      rightLeg.add(rLegMesh);
      const rFoot = new THREE.Mesh(new THREE.BoxGeometry(0.19, 0.13, 0.28), footMat);
      rFoot.position.set(0, -0.3, 0.06);
      rightLeg.add(rFoot);

      // Left Arm
      leftArm.position.set(-0.42, 0.85, 0);
      const lArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 10), limbMat);
      lArmMesh.position.y = -0.15;
      leftArm.add(lArmMesh);
      const lHand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), footMat);
      lHand.position.set(0, -0.3, 0);
      leftArm.add(lHand);

      // Right Arm
      rightArm.position.set(0.42, 0.85, 0);
      const rArmMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.36, 10), limbMat);
      rArmMesh.position.y = -0.15;
      rightArm.add(rArmMesh);
      const rHand = new THREE.Mesh(new THREE.SphereGeometry(0.11, 10, 10), footMat);
      rHand.position.set(0, -0.3, 0);
      rightArm.add(rHand);
    }

    // Assemble character hierarchy
    tailPivot.position.set(0, 0.4, 0);
    bodyPivot.add(tailPivot);
    bodyPivot.add(wingsPivot);
    bodyPivot.add(headPivot);

    group.add(bodyPivot);
    group.add(leftLeg);
    group.add(rightLeg);
    group.add(leftArm);
    group.add(rightArm);

    // Expose nodes for animation controller
    group.animNodes = {
      bodyPivot,
      headPivot,
      leftLeg,
      rightLeg,
      leftArm,
      rightArm,
      tailPivot,
      wingsPivot,
      scarfPivot,
      capePivot
    };

    return group;
  },

  // ----------------------------------------------------
  // COLLECTIBLES & POWER-UP MESHES
  // ----------------------------------------------------

  createCoinMesh() {
    const group = new THREE.Group();
    group.name = "collectible_coin";

    const coinMat = this.getMaterial("coinMat", () => new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.88,
      roughness: 0.12,
      emissive: 0xd97706,
      emissiveIntensity: 0.45
    }));

    const coinGeo = new THREE.CylinderGeometry(0.48, 0.48, 0.14, 18);
    const coin = new THREE.Mesh(coinGeo, coinMat);
    coin.rotation.x = Math.PI / 2;
    group.add(coin);

    // Star icon inside coin
    const starMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const starGeo = new THREE.ConeGeometry(0.24, 0.06, 5);
    const star = new THREE.Mesh(starGeo, starMat);
    star.position.z = 0.08;
    group.add(star);

    return group;
  },

  createGemMesh() {
    const group = new THREE.Group();
    group.name = "collectible_gem";

    const gemMat = this.getMaterial("gemMat", () => new THREE.MeshStandardMaterial({
      color: 0xc084fc,
      emissive: 0xa855f7,
      emissiveIntensity: 0.75,
      metalness: 0.3,
      roughness: 0.08,
      transparent: true,
      opacity: 0.95
    }));

    const gemGeo = new THREE.OctahedronGeometry(0.48, 0);
    const gem = new THREE.Mesh(gemGeo, gemMat);
    group.add(gem);

    return group;
  },

  createPowerupMesh(type) {
    const group = new THREE.Group();
    group.name = `powerup_${type}`;

    // Glowing aura container
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.45,
      wireframe: true
    });
    const halo = new THREE.Mesh(new THREE.SphereGeometry(0.8, 14, 14), haloMat);
    group.add(halo);

    if (type === "magnet") {
      const uMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.4 });
      const tipMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
      const uShape = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.11, 10, 20, Math.PI), uMat);
      uShape.rotation.z = Math.PI;
      group.add(uShape);

      [-0.38, 0.38].forEach(x => {
        const tip = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 0.22, 10), tipMat);
        tip.position.set(x, 0.1, 0);
        group.add(tip);
      });
    } else if (type === "shield") {
      const shieldMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.88,
        metalness: 0.5,
        roughness: 0.1
      });
      const shield = new THREE.Mesh(new THREE.IcosahedronGeometry(0.56, 1), shieldMat);
      group.add(shield);
    } else if (type === "wings") {
      const wingMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.6 });
      [-0.34, 0.34].forEach(x => {
        const wing = new THREE.Mesh(new THREE.ConeGeometry(0.24, 0.7, 8), wingMat);
        wing.position.set(x, 0, 0);
        wing.rotation.z = x > 0 ? -0.85 : 0.85;
        group.add(wing);
      });
    } else {
      // 2X Multiplier Star
      const starMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x9333ea, emissiveIntensity: 0.8 });
      const star = new THREE.Mesh(new THREE.OctahedronGeometry(0.55, 0), starMat);
      group.add(star);
    }

    return group;
  },

  // ----------------------------------------------------
  // SCULPTED 3D HURDLES & OBSTACLES (Vibrant Thematic Shapes)
  // ----------------------------------------------------

  createObstacle(type, worldId) {
    const group = new THREE.Group();
    group.name = `obstacle_${type}_${worldId}`;

    const world = WONDER_CONFIG.WORLDS.find(w => w.id === worldId) || WONDER_CONFIG.WORLDS[0];
    const themeColor = new THREE.Color(world.themeColor);
    const accentColor = new THREE.Color(world.accentColor);

    if (type === "low_jump") {
      // ==========================================
      // LOW JUMP HURDLES (~0.8m height)
      // ==========================================
      if (worldId === "candy_kingdom") {
        // Striped Peppermint Candy Roller on Chocolate Wafer Stands
        const candyMat = new THREE.MeshStandardMaterial({
          color: 0xf43f5e,
          emissive: 0xe11d48,
          emissiveIntensity: 0.4,
          roughness: 0.2
        });
        const candy = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 2.2, 18), candyMat);
        candy.rotation.z = Math.PI / 2;
        candy.position.y = 0.42;
        group.add(candy);

        // White sugar spirals
        [-0.7, 0, 0.7].forEach(x => {
          const ring = new THREE.Mesh(new THREE.TorusGeometry(0.43, 0.06, 8, 16), new THREE.MeshStandardMaterial({ color: 0xffffff }));
          ring.position.set(x, 0.42, 0);
          ring.rotation.y = Math.PI / 2;
          group.add(ring);
        });

        // Wafer side posts
        [-1.1, 1.1].forEach(x => {
          const post = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.9, 0.4), new THREE.MeshStandardMaterial({ color: 0x78350f }));
          post.position.set(x, 0.45, 0);
          group.add(post);
        });

      } else if (worldId === "space_adventure") {
        // High-Tech Cyber Laser Tripwire with Pulsing Turquoise Beam
        const pylonMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 });
        [-1.15, 1.15].forEach(x => {
          const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.3, 12), pylonMat);
          base.position.set(x, 0.15, 0);
          group.add(base);

          const post = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.8, 10), pylonMat);
          post.position.set(x, 0.55, 0);
          group.add(post);

          const bulb = new THREE.Mesh(
            new THREE.SphereGeometry(0.15, 10, 10),
            new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 1.0 })
          );
          bulb.position.set(x, 0.85, 0);
          group.add(bulb);
        });

        const laserBeam = new THREE.Mesh(
          new THREE.CylinderGeometry(0.08, 0.08, 2.3, 10),
          new THREE.MeshBasicMaterial({ color: 0x00f0ff })
        );
        laserBeam.rotation.z = Math.PI / 2;
        laserBeam.position.y = 0.52;
        group.add(laserBeam);

      } else if (worldId === "crystal_mountains") {
        // Amethyst Crystal Spikes protruding from Glacier Rock
        const rock = new THREE.Mesh(
          new THREE.DodecahedronGeometry(0.6, 0),
          new THREE.MeshStandardMaterial({ color: 0x0e7490, roughness: 0.4 })
        );
        rock.scale.set(2.2, 0.6, 0.9);
        rock.position.y = 0.25;
        group.add(rock);

        const cMat = new THREE.MeshStandardMaterial({
          color: 0xc084fc,
          emissive: 0xa855f7,
          emissiveIntensity: 0.8,
          roughness: 0.1,
          metalness: 0.4
        });
        [-0.7, -0.2, 0.3, 0.7].forEach((x, idx) => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.18 + idx * 0.03, 0.75 + idx * 0.1, 6), cMat);
          spike.position.set(x, 0.45 + idx * 0.05, 0);
          spike.rotation.z = (x > 0 ? -0.15 : 0.15);
          group.add(spike);
        });

      } else if (worldId === "dinosaur_island") {
        // Prehistoric Spiked Fossil Bone Log with Glowing Magma Cracks
        const boneMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.6 });
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 2.3, 10), boneMat);
        log.rotation.z = Math.PI / 2;
        log.position.y = 0.38;
        group.add(log);

        // Prehistoric Amber spikes
        const amberMat = new THREE.MeshStandardMaterial({
          color: 0xf97316,
          emissive: 0xea580c,
          emissiveIntensity: 0.7,
          roughness: 0.2
        });
        [-0.6, 0, 0.6].forEach(x => {
          const spike = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.45, 6), amberMat);
          spike.position.set(x, 0.72, 0);
          group.add(spike);
        });

      } else {
        // Enchanted Forest / Rainbow / Ocean: Hollow Mossy Tree Trunk with Glowing Mushrooms
        const logMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.5 });
        const log = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.42, 2.3, 12), logMat);
        log.rotation.z = Math.PI / 2;
        log.position.y = 0.38;
        group.add(log);

        // Glowing Fairy Mushrooms
        const mushMat = new THREE.MeshStandardMaterial({
          color: 0xef4444,
          emissive: 0xdc2626,
          emissiveIntensity: 0.8,
          roughness: 0.2
        });
        [-0.6, 0.1, 0.6].forEach(x => {
          const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), mushMat);
          cap.position.set(x, 0.74, 0.08);
          group.add(cap);

          const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.07, 0.25, 8), new THREE.MeshBasicMaterial({ color: 0xffffff }));
          stem.position.set(x, 0.62, 0.08);
          group.add(stem);
        });

        // Glowing Jump Arrow Sign
        const arrowMat = new THREE.MeshStandardMaterial({ color: 0x22c55e, emissive: 0x16a085, emissiveIntensity: 0.9 });
        const arrow = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.32, 4), arrowMat);
        arrow.position.set(0, 0.95, 0.2);
        group.add(arrow);
      }
      group.hitBox = { width: 2.2, height: 0.85, depth: 0.8, type: "low" };

    } else if (type === "high_slide") {
      // ==========================================
      // HIGH SLIDE OVERHEAD BARRIERS (Pass under)
      // ==========================================
      const archColor = new THREE.Color(world.themeColor);
      const beamMat = new THREE.MeshStandardMaterial({
        color: archColor,
        emissive: archColor.clone().multiplyScalar(0.25),
        roughness: 0.35,
        metalness: 0.2
      });

      // Overhead crossbeam at height 1.65m
      const archTop = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.6, 0.65), beamMat);
      archTop.position.y = 1.68;
      group.add(archTop);

      // Support pillars on left & right edges
      [-1.15, 1.15].forEach(x => {
        const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.22, 1.7, 10), beamMat);
        pillar.position.set(x, 0.85, 0);
        group.add(pillar);
      });

      // World-specific hanging obstacle details
      if (worldId === "candy_kingdom") {
        // Dripping sugar icicles & lollipop drops
        [-0.6, 0, 0.6].forEach(x => {
          const drop = new THREE.Mesh(
            new THREE.ConeGeometry(0.12, 0.45, 8),
            new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xf43f5e, emissiveIntensity: 0.3 })
          );
          drop.position.set(x, 1.25, 0);
          drop.rotation.x = Math.PI;
          group.add(drop);
        });
      } else if (worldId === "space_adventure") {
        // High-voltage warning spark generator
        const warnLight = new THREE.Mesh(
          new THREE.SphereGeometry(0.22, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xf59e0b, emissive: 0xf59e0b, emissiveIntensity: 1.0 })
        );
        warnLight.position.set(0, 1.35, 0);
        group.add(warnLight);
      } else {
        // Hanging glowing lanterns & slide indicator arrow
        const slideArrow = new THREE.Mesh(
          new THREE.ConeGeometry(0.18, 0.32, 4),
          new THREE.MeshStandardMaterial({ color: 0x38bdf8, emissive: 0x0284c7, emissiveIntensity: 0.9 })
        );
        slideArrow.position.set(0, 1.3, 0.2);
        slideArrow.rotation.z = Math.PI;
        group.add(slideArrow);
      }

      group.hitBox = { width: 2.3, height: 1.85, depth: 0.85, type: "high" };

    } else {
      // ==========================================
      // FULL LANE BLOCKERS (Must switch lanes)
      // ==========================================
      if (worldId === "candy_kingdom") {
        // 3-Tier Frosted Birthday Cake / Giant Gummy Pillar
        const cake1 = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.75, 0.65, 18), new THREE.MeshStandardMaterial({ color: 0xf43f5e, roughness: 0.3 }));
        cake1.position.y = 0.35;
        group.add(cake1);

        const cake2 = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.58, 0.55, 18), new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 }));
        cake2.position.y = 0.9;
        group.add(cake2);

        const cake3 = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.4, 0.45, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.2 }));
        cake3.position.y = 1.38;
        group.add(cake3);

        const cherry = new THREE.Mesh(
          new THREE.SphereGeometry(0.2, 12, 12),
          new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 0.8 })
        );
        cherry.position.y = 1.75;
        group.add(cherry);

      } else if (worldId === "space_adventure") {
        // High-Tech Quantum Fusion Reactor Core
        const coreMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.85, roughness: 0.15 });
        const core = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 1.9, 16), coreMat);
        core.position.y = 0.95;
        group.add(core);

        [-0.4, 0, 0.4].forEach(yOff => {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.72, 0.08, 10, 20),
            new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.9 })
          );
          ring.position.y = 0.95 + yOff;
          ring.rotation.x = Math.PI / 2;
          group.add(ring);
        });

      } else if (worldId === "dinosaur_island") {
        // Active Smoldering Volcanic Magma Pillar
        const rockMat = new THREE.MeshStandardMaterial({ color: 0x292524, roughness: 0.8 });
        const rock = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.85, 2.0, 10), rockMat);
        rock.position.y = 1.0;
        group.add(rock);

        const magma = new THREE.Mesh(
          new THREE.SphereGeometry(0.4, 10, 10),
          new THREE.MeshStandardMaterial({ color: 0xf97316, emissive: 0xea580c, emissiveIntensity: 1.0 })
        );
        magma.position.y = 2.0;
        group.add(magma);

      } else if (worldId === "crystal_mountains") {
        // Towering Amethyst Crystal Spire
        const spire = new THREE.Mesh(
          new THREE.ConeGeometry(0.72, 2.6, 6),
          new THREE.MeshStandardMaterial({ color: 0xc084fc, emissive: 0x9333ea, emissiveIntensity: 0.7, roughness: 0.1, metalness: 0.4 })
        );
        spire.position.y = 1.3;
        group.add(spire);

      } else {
        // Ancient Carved Stone Golem Totem with Glowing Runic Eyes
        const totemMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.7 });
        const totem = new THREE.Mesh(new THREE.BoxGeometry(1.2, 2.2, 1.2), totemMat);
        totem.position.y = 1.1;
        group.add(totem);

        // Glowing runic eyes
        const eyeMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 1.0 });
        [-0.3, 0.3].forEach(x => {
          const eye = new THREE.Mesh(new THREE.SphereGeometry(0.14, 8, 8), eyeMat);
          eye.position.set(x, 1.6, 0.62);
          group.add(eye);
        });

        // Golden rune plate
        const rune = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.6, 0.1), eyeMat);
        rune.position.set(0, 0.8, 0.62);
        group.add(rune);
      }
      group.hitBox = { width: 1.65, height: 2.3, depth: 1.4, type: "blocker" };
    }

    return group;
  },

  // ----------------------------------------------------
  // OVERHEAD ARCH GATEWAYS (Thematic Landmarks Every ~100m)
  // ----------------------------------------------------

  createOverheadArch(worldId) {
    const group = new THREE.Group();
    group.name = `overhead_arch_${worldId}`;

    const world = WONDER_CONFIG.WORLDS.find(w => w.id === worldId) || WONDER_CONFIG.WORLDS[0];
    const themeColor = new THREE.Color(world.themeColor);
    const accentColor = new THREE.Color(world.accentColor);

    if (worldId === "enchanted_forest") {
      // Magic Ancient Oak Gateway with Glowing Golden Lanterns
      const archMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.6 });
      const archMesh = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.42, 10, 24, Math.PI), archMat);
      archMesh.position.set(0, 0, 0);
      group.add(archMesh);

      [-2.6, 0, 2.6].forEach(x => {
        const lanternMat = new THREE.MeshStandardMaterial({
          color: 0xfbbf24,
          emissive: 0xf59e0b,
          emissiveIntensity: 1.0,
          roughness: 0.1
        });
        const lantern = new THREE.Mesh(new THREE.SphereGeometry(0.35, 10, 10), lanternMat);
        const yPos = x === 0 ? 3.8 : 3.2;
        lantern.position.set(x, yPos, 0);
        group.add(lantern);
      });

    } else if (worldId === "candy_kingdom") {
      // Giant Peppermint Candy Gateway with Glowing Strawberry Orb
      const caneMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.4,
        roughness: 0.25
      });
      const archMesh = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.45, 10, 24, Math.PI), caneMat);
      group.add(archMesh);

      const candyCenter = new THREE.Mesh(
        new THREE.CylinderGeometry(0.7, 0.7, 0.25, 20),
        new THREE.MeshStandardMaterial({ color: 0xfbbf24, emissive: 0xf59e0b, emissiveIntensity: 0.6 })
      );
      candyCenter.rotation.x = Math.PI / 2;
      candyCenter.position.set(0, 4.0, 0);
      group.add(candyCenter);

    } else if (worldId === "space_adventure") {
      // Holographic Sci-Fi Warp Gate with Dual Neon Rings
      const ringMat = new THREE.MeshStandardMaterial({
        color: 0x00f0ff,
        emissive: 0x00f0ff,
        emissiveIntensity: 1.0,
        roughness: 0.1
      });
      const ring = new THREE.Mesh(new THREE.TorusGeometry(4.0, 0.18, 10, 28, Math.PI), ringMat);
      group.add(ring);

      [-3.9, 3.9].forEach(x => {
        const emitter = new THREE.Mesh(
          new THREE.CylinderGeometry(0.35, 0.45, 4.2, 12),
          new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.2 })
        );
        emitter.position.set(x, 2.1, 0);
        group.add(emitter);
      });

    } else {
      // Grand Palace / Crystal Gate
      const pillarMat = new THREE.MeshStandardMaterial({
        color: themeColor,
        emissive: themeColor.clone().multiplyScalar(0.3),
        roughness: 0.25,
        metalness: 0.35
      });
      const crossbar = new THREE.Mesh(new THREE.BoxGeometry(8.6, 0.7, 0.9), pillarMat);
      crossbar.position.set(0, 4.3, 0);
      group.add(crossbar);

      const gemCrest = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.55, 0),
        new THREE.MeshStandardMaterial({ color: accentColor, emissive: accentColor, emissiveIntensity: 0.9 })
      );
      gemCrest.position.set(0, 4.9, 0);
      group.add(gemCrest);

      [-4.0, 4.0].forEach(x => {
        const col = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.45, 4.3, 12), pillarMat);
        col.position.set(x, 2.15, 0);
        group.add(col);
      });
    }

    return group;
  },

  // ----------------------------------------------------
  // SIDE SCENERY & TRACK PROPS (Rich Environmental Visuals)
  // ----------------------------------------------------

  createSideProp(worldId, side = 1) {
    const group = new THREE.Group();
    const world = WONDER_CONFIG.WORLDS.find(w => w.id === worldId) || WONDER_CONFIG.WORLDS[0];

    if (worldId === "enchanted_forest") {
      // Multi-layer Glowing Magic Pine Tree
      const trunk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.32, 0.58, 3.4, 10),
        new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.7 })
      );
      trunk.position.y = 1.7;
      group.add(trunk);

      const leavesMat1 = new THREE.MeshStandardMaterial({ color: 0x059669, emissive: 0x047857, emissiveIntensity: 0.25 });
      const leaves1 = new THREE.Mesh(new THREE.ConeGeometry(2.1, 2.5, 10), leavesMat1);
      leaves1.position.y = 3.6;
      group.add(leaves1);

      const leavesMat2 = new THREE.MeshStandardMaterial({ color: 0x10b981, emissive: 0x059669, emissiveIntensity: 0.3 });
      const leaves2 = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.1, 10), leavesMat2);
      leaves2.position.y = 4.8;
      group.add(leaves2);

      // Glowing fairy mushroom at tree base
      const mushMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        emissive: 0xf59e0b,
        emissiveIntensity: 0.8,
        roughness: 0.2
      });
      const mush = new THREE.Mesh(new THREE.SphereGeometry(0.4, 10, 10, 0, Math.PI * 2, 0, Math.PI / 2), mushMat);
      mush.position.set(side * 0.85, 0.4, 0.4);
      group.add(mush);

    } else if (worldId === "candy_kingdom") {
      // Giant Glowing Lollipop / Candy Cane
      const stalk = new THREE.Mesh(
        new THREE.CylinderGeometry(0.24, 0.24, 3.8, 10),
        new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 })
      );
      stalk.position.y = 1.9;
      group.add(stalk);

      const popMat = new THREE.MeshStandardMaterial({
        color: 0xf43f5e,
        emissive: 0xe11d48,
        emissiveIntensity: 0.5,
        roughness: 0.2
      });
      const pop = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 1.0, 0.3, 18), popMat);
      pop.position.set(0, 3.8, 0);
      pop.rotation.x = Math.PI / 2;
      group.add(pop);

    } else if (worldId === "crystal_mountains") {
      // Cluster of 3 Radiant Amethyst & Sapphire Crystals
      const cMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.5,
        roughness: 0.1,
        metalness: 0.6
      });
      [-0.5, 0.1, 0.6].forEach((offset, idx) => {
        const shard = new THREE.Mesh(new THREE.ConeGeometry(0.38 + idx * 0.15, 2.5 + idx * 1.0, 6), cMat);
        shard.position.set(offset, 1.25 + idx * 0.5, 0);
        shard.rotation.z = (offset) * 0.25;
        group.add(shard);
      });

    } else if (worldId === "space_adventure") {
      // Floating Space Orbital Relay Satellite
      const satMat = new THREE.MeshStandardMaterial({ color: 0x8b5cf6, emissive: 0x6d28d9, emissiveIntensity: 0.4, metalness: 0.7 });
      const sat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 1.0, 1.0), satMat);
      sat.position.y = 3.5;
      group.add(sat);

      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(3.0, 0.5, 0.08),
        new THREE.MeshStandardMaterial({ color: 0x00f0ff, emissive: 0x00f0ff, emissiveIntensity: 0.8 })
      );
      panel.position.y = 3.5;
      group.add(panel);

    } else {
      // Themed Majestic World Pillar
      const pillarMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(world.themeColor),
        emissive: new THREE.Color(world.themeColor).multiplyScalar(0.25),
        roughness: 0.3
      });
      const pillar = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.8, 4.2, 10), pillarMat);
      pillar.position.y = 2.1;
      group.add(pillar);

      const top = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 14, 14),
        new THREE.MeshStandardMaterial({
          color: new THREE.Color(world.accentColor),
          emissive: new THREE.Color(world.accentColor),
          emissiveIntensity: 0.6
        })
      );
      top.position.y = 4.6;
      group.add(top);
    }

    return group;
  }
};

window.WonderModels = WonderModels;
