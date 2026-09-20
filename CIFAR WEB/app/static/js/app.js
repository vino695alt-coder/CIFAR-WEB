/**
 * CIFAR Vision — Frontend Application Controller
 * Handles drag-and-drop, client-side validation, previews,
 * Continuous Live Laptop Camera AI stream, animated probability bars,
 * sample testing, and state management.
 */

document.addEventListener("DOMContentLoaded", () => {
    // Mode Switcher Elements
    const tabUploadMode = document.getElementById("tabUploadMode");
    const tabCameraMode = document.getElementById("tabCameraMode");
    const uploadModeView = document.getElementById("uploadModeView");
    const cameraModeView = document.getElementById("cameraModeView");
    const switchDirectCameraBtn = document.getElementById("switchDirectCameraBtn");

    // File Upload Elements
    const dropzone = document.getElementById("dropzone");
    const fileInput = document.getElementById("fileInput");
    const dropzoneIdle = document.getElementById("dropzoneIdle");
    const dropzonePreview = document.getElementById("dropzonePreview");
    const previewImg = document.getElementById("previewImg");
    const previewFilename = document.getElementById("previewFilename");
    const previewFilesize = document.getElementById("previewFilesize");
    const previewResolution = document.getElementById("previewResolution");
    const browseBtn = document.getElementById("browseBtn");
    const changeImageBtn = document.getElementById("changeImageBtn");

    const predictionForm = document.getElementById("predictionForm");
    const predictBtn = document.getElementById("predictBtn");
    const btnSpinner = document.getElementById("btnSpinner");
    const btnLabel = document.getElementById("btnLabel");
    const clearBtn = document.getElementById("clearBtn");
    const sampleButtons = document.querySelectorAll(".sample-btn");

    // Continuous Live Camera Elements
    const liveVideo = document.getElementById("liveVideo");
    const liveCanvas = document.getElementById("liveCanvas");
    const cameraOffOverlay = document.getElementById("cameraOffOverlay");
    const liveViewfinder = document.getElementById("liveViewfinder");
    const startLiveStreamBtn = document.getElementById("startLiveStreamBtn");
    const stopCameraBtn = document.getElementById("stopCameraBtn");
    const toggleLivePredictBtn = document.getElementById("toggleLivePredictBtn");
    const toggleLivePredictLabel = document.getElementById("toggleLivePredictLabel");
    const cameraSelect = document.getElementById("cameraSelect");
    const flipLiveCameraBtn = document.getElementById("flipLiveCameraBtn");
    const streamStatusVal = document.getElementById("streamStatusVal");
    const streamIntervalVal = document.getElementById("streamIntervalVal");

    // Alert & Output Elements
    const errorBanner = document.getElementById("errorBanner");
    const errorHeading = document.getElementById("errorHeading");
    const errorMessage = document.getElementById("errorMessage");
    const errorDismissBtn = document.getElementById("errorDismissBtn");

    const idleState = document.getElementById("idleState");
    const loadingState = document.getElementById("loadingState");
    const resultContent = document.getElementById("resultContent");
    const inferenceBadge = document.getElementById("inferenceBadge");

    const resultHeroIcon = document.getElementById("resultHeroIcon");
    const resultClassName = document.getElementById("resultClassName");
    const resultConfidence = document.getElementById("resultConfidence");
    const top3Podium = document.getElementById("top3Podium");
    const probabilityList = document.getElementById("probabilityList");

    // App State Variables
    let selectedFile = null;
    let liveMediaStream = null;
    let isLivePredicting = false;
    let liveInferenceTimer = null;
    let isInferring = false;
    let isMirrored = true;
    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
    const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/jpg"];

    // --------------------------------------------------------------------------
    // Error & Notification Helpers
    // --------------------------------------------------------------------------

    function showError(heading, message) {
        errorHeading.textContent = heading || "Error";
        errorMessage.textContent = message || "An unexpected error occurred.";
        errorBanner.classList.remove("hidden");
        errorBanner.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    function hideError() {
        errorBanner.classList.add("hidden");
    }

    if (errorDismissBtn) {
        errorDismissBtn.addEventListener("click", hideError);
    }

    function formatBytes(bytes, decimals = 1) {
        if (bytes === 0) return "0 Bytes";
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ["Bytes", "KB", "MB", "GB"];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
    }

    // --------------------------------------------------------------------------
    // Mode Switcher (Upload vs Live Camera)
    // --------------------------------------------------------------------------

    function switchMode(mode) {
        hideError();
        if (mode === "camera") {
            tabUploadMode.classList.remove("active");
            tabUploadMode.setAttribute("aria-selected", "false");
            tabCameraMode.classList.add("active");
            tabCameraMode.setAttribute("aria-selected", "true");

            uploadModeView.classList.add("hidden");
            cameraModeView.classList.remove("hidden");

            // Auto-prompt to start camera if not already active
            if (!liveMediaStream) {
                startLaptopCamera();
            }
        } else {
            tabCameraMode.classList.remove("active");
            tabCameraMode.setAttribute("aria-selected", "false");
            tabUploadMode.classList.add("active");
            tabUploadMode.setAttribute("aria-selected", "true");

            cameraModeView.classList.add("hidden");
            uploadModeView.classList.remove("hidden");

            // Pause live stream prediction when on upload tab
            if (isLivePredicting) {
                toggleLivePrediction(false);
            }
        }
    }

    tabUploadMode.addEventListener("click", () => switchMode("upload"));
    tabCameraMode.addEventListener("click", () => switchMode("camera"));
    if (switchDirectCameraBtn) {
        switchDirectCameraBtn.addEventListener("click", () => switchMode("camera"));
    }

    // --------------------------------------------------------------------------
    // File Upload Handling
    // --------------------------------------------------------------------------

    function handleFile(file) {
        hideError();

        if (!file) {
            showError("No File Selected", "Please select an image before predicting.");
            return;
        }

        const fileExt = file.name.split(".").pop().toLowerCase();
        const validExts = ["jpg", "jpeg", "png", "webp"];
        if (!validExts.includes(fileExt) && !ALLOWED_TYPES.includes(file.type)) {
            showError("Unsupported File", "Please upload JPG, JPEG, PNG, or WEBP.");
            return;
        }

        if (file.size > MAX_FILE_SIZE) {
            showError("File Too Large", "Image is too large. Maximum file size is 5 MB.");
            return;
        }

        selectedFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            previewImg.src = e.target.result;
            previewFilename.textContent = file.name;
            previewFilesize.textContent = formatBytes(file.size);

            const img = new Image();
            img.onload = () => {
                previewResolution.textContent = `${img.naturalWidth} × ${img.naturalHeight}`;
            };
            img.src = e.target.result;

            dropzoneIdle.classList.add("hidden");
            dropzonePreview.classList.remove("hidden");
            predictBtn.disabled = false;
        };
        reader.onerror = () => {
            showError("Read Error", "We couldn't read this image. Please upload a valid image file.");
        };
        reader.readAsDataURL(file);
    }

    browseBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });

    changeImageBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener("change", (e) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Drag & Drop
    ["dragenter", "dragover"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        });
    });

    ["dragleave", "drop"].forEach((eventName) => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        });
    });

    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        if (dt && dt.files && dt.files.length > 0) {
            handleFile(dt.files[0]);
        }
    });

    // Sample Image Buttons
    sampleButtons.forEach((btn) => {
        btn.addEventListener("click", async () => {
            const className = btn.getAttribute("data-class");
            const sampleUrl = `/static/images/samples/sample_${className}.png`;

            try {
                const response = await fetch(sampleUrl);
                if (!response.ok) throw new Error("Sample file not found");
                const blob = await response.blob();
                const file = new File([blob], `sample_${className}.png`, { type: "image/png" });
                handleFile(file);
            } catch (err) {
                console.error("Error loading sample:", err);
            }
        });
    });

    // Manual Upload Prediction Submission
    predictionForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        hideError();

        if (!selectedFile) {
            showError("No Image", "Please select an image before predicting.");
            return;
        }

        predictBtn.disabled = true;
        btnSpinner.classList.remove("hidden");
        btnLabel.textContent = "Analyzing...";

        idleState.classList.add("hidden");
        resultContent.classList.add("hidden");
        loadingState.classList.remove("hidden");
        inferenceBadge.textContent = "Processing...";

        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const startTime = performance.now();
            const response = await fetch("/predict", {
                method: "POST",
                body: formData
            });

            let data = null;
            try {
                data = await response.json();
            } catch (jsonErr) {
                throw new Error(`Server returned error (${response.status}: ${response.statusText || "Inference error"})`);
            }

            const elapsed = Math.round(performance.now() - startTime);

            if (!response.ok || !data || !data.success) {
                throw new Error((data && data.error) ? data.error : "Prediction request failed.");
            }

            renderResults(data, elapsed);
        } catch (error) {
            console.error("Prediction error:", error);
            showError("Prediction Failed", error.message || "Prediction service is temporarily unavailable.");
            loadingState.classList.add("hidden");
            idleState.classList.remove("hidden");
            inferenceBadge.textContent = "Error";
        } finally {
            predictBtn.disabled = false;
            btnSpinner.classList.add("hidden");
            btnLabel.textContent = "✦ Predict Image";
        }
    });

    // --------------------------------------------------------------------------
    // Real-Time Continuous Live Webcam Streaming & Prediction
    // --------------------------------------------------------------------------

    async function startLaptopCamera() {
        hideError();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showError(
                "Camera Not Supported",
                "Your browser does not support camera access or requires a secure origin (localhost/HTTPS)."
            );
            return;
        }

        try {
            // Stop previous stream if any
            stopLaptopCamera();

            const selectedDeviceId = cameraSelect.value;
            const videoConstraints = {
                width: { ideal: 640 },
                height: { ideal: 480 }
            };

            if (selectedDeviceId) {
                videoConstraints.deviceId = { exact: selectedDeviceId };
            } else {
                videoConstraints.facingMode = "user";
            }

            streamStatusVal.textContent = "Connecting...";
            liveMediaStream = await navigator.mediaDevices.getUserMedia({
                video: videoConstraints,
                audio: false
            });

            liveVideo.srcObject = liveMediaStream;
            await liveVideo.play();

            // Show active video HUD
            cameraOffOverlay.classList.add("hidden");
            liveViewfinder.classList.remove("hidden");
            toggleLivePredictBtn.disabled = false;
            stopCameraBtn.disabled = false;
            streamStatusVal.textContent = "Streaming Live";

            // Enumerate cameras once permissions are granted
            populateCameraDevices();

            // Start continuous real-time prediction loop
            toggleLivePrediction(true);
        } catch (err) {
            console.error("Webcam access error:", err);
            let userMsg = "Could not turn on camera. Please allow camera permissions in your browser.";
            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                userMsg = "Camera permission was denied. Please click the camera/lock icon in your browser URL bar to allow camera access.";
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                userMsg = "No webcam device was found on your laptop.";
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                userMsg = "Camera is already in use by another application (Zoom, Teams, etc.). Please close other apps and try again.";
            }
            showError("Camera Error", userMsg);
            stopLaptopCamera();
        }
    }

    function stopLaptopCamera() {
        // Stop inference loop
        toggleLivePrediction(false);

        if (liveMediaStream) {
            liveMediaStream.getTracks().forEach((track) => track.stop());
            liveMediaStream = null;
        }
        if (liveVideo) {
            liveVideo.srcObject = null;
        }

        cameraOffOverlay.classList.remove("hidden");
        liveViewfinder.classList.add("hidden");
        toggleLivePredictBtn.disabled = true;
        stopCameraBtn.disabled = true;
        streamStatusVal.textContent = "Camera Off";
    }

    async function populateCameraDevices() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoInputs = devices.filter((d) => d.kind === "videoinput");

            if (videoInputs.length > 0) {
                const currentVal = cameraSelect.value;
                cameraSelect.innerHTML = "";
                videoInputs.forEach((device, idx) => {
                    const option = document.createElement("option");
                    option.value = device.deviceId;
                    option.textContent = device.label || `Camera ${idx + 1}`;
                    if (device.deviceId === currentVal) option.selected = true;
                    cameraSelect.appendChild(option);
                });
            }
        } catch (e) {
            console.warn("Could not enumerate camera devices:", e);
        }
    }

    function toggleLivePrediction(shouldEnable) {
        if (typeof shouldEnable === "boolean") {
            isLivePredicting = shouldEnable;
        } else {
            isLivePredicting = !isLivePredicting;
        }

        if (isLivePredicting) {
            toggleLivePredictBtn.classList.remove("live-paused");
            toggleLivePredictLabel.textContent = "Continuous Prediction: ON";
            streamStatusVal.textContent = "Live AI Predicting";
            startLiveInferenceLoop();
        } else {
            toggleLivePredictBtn.classList.add("live-paused");
            toggleLivePredictLabel.textContent = "Continuous Prediction: Paused";
            streamStatusVal.textContent = "Stream Paused";
            if (liveInferenceTimer) {
                clearTimeout(liveInferenceTimer);
                liveInferenceTimer = null;
            }
        }
    }

    function startLiveInferenceLoop() {
        if (liveInferenceTimer) clearTimeout(liveInferenceTimer);

        async function loop() {
            if (!isLivePredicting || !liveMediaStream || !liveVideo.videoWidth) {
                liveInferenceTimer = setTimeout(loop, 400);
                return;
            }

            if (!isInferring) {
                isInferring = true;
                await captureAndPredictLiveFrame();
                isInferring = false;
            }

            if (isLivePredicting) {
                liveInferenceTimer = setTimeout(loop, 400); // Throttled every 400ms
            }
        }

        loop();
    }

    async function captureAndPredictLiveFrame() {
        const videoW = liveVideo.videoWidth;
        const videoH = liveVideo.videoHeight;
        if (!videoW || !videoH) return;

        // Crop centered square
        const squareSize = Math.min(videoW, videoH);
        const startX = (videoW - squareSize) / 2;
        const startY = (videoH - squareSize) / 2;

        liveCanvas.width = 128; // Downscale directly for superfast network transfer
        liveCanvas.height = 128;
        const ctx = liveCanvas.getContext("2d");

        if (isMirrored) {
            ctx.translate(128, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(
            liveVideo,
            startX, startY, squareSize, squareSize,
            0, 0, 128, 128
        );

        return new Promise((resolve) => {
            liveCanvas.toBlob(async (blob) => {
                if (!blob) {
                    resolve();
                    return;
                }

                const formData = new FormData();
                formData.append("file", blob, "live_frame.jpg");

                try {
                    const startTime = performance.now();
                    const response = await fetch("/predict", {
                        method: "POST",
                        body: formData
                    });
                    const data = await response.json();
                    const elapsed = Math.round(performance.now() - startTime);

                    if (response.ok && data.success) {
                        renderResults(data, elapsed);
                        streamIntervalVal.textContent = `${elapsed} ms latency`;
                    }
                } catch (err) {
                    console.error("Live frame prediction error:", err);
                } finally {
                    resolve();
                }
            }, "image/jpeg", 0.85);
        });
    }

    // Camera Event Listeners
    startLiveStreamBtn.addEventListener("click", startLaptopCamera);
    stopCameraBtn.addEventListener("click", stopLaptopCamera);
    toggleLivePredictBtn.addEventListener("click", () => toggleLivePrediction());

    cameraSelect.addEventListener("change", () => {
        if (liveMediaStream) {
            startLaptopCamera();
        }
    });

    flipLiveCameraBtn.addEventListener("click", () => {
        isMirrored = !isMirrored;
        if (isMirrored) {
            liveVideo.classList.remove("unmirrored");
        } else {
            liveVideo.classList.add("unmirrored");
        }
    });

    // --------------------------------------------------------------------------
    // Render Results & Probability Bars
    // --------------------------------------------------------------------------

    function renderResults(data, elapsedMs) {
        loadingState.classList.add("hidden");
        idleState.classList.add("hidden");
        resultContent.classList.remove("hidden");
        inferenceBadge.textContent = `Live Active (${elapsedMs}ms)`;

        const prediction = data.prediction;
        const topPredictions = data.top_predictions;
        const allSorted = data.all_classes_sorted;

        // 1. Primary Result Spotlight
        resultHeroIcon.textContent = prediction.icon || "🎯";
        resultClassName.textContent = prediction.class_name.toUpperCase();
        resultConfidence.textContent = `${prediction.confidence.toFixed(2)}%`;

        // 2. Top-3 Podium Rankings
        top3Podium.innerHTML = "";
        topPredictions.forEach((item, index) => {
            const rank = index + 1;
            const rankLabel = rank < 10 ? `0${rank}` : `${rank}`;
            const podiumCard = document.createElement("div");
            podiumCard.className = `podium-card rank-${rank}`;
            podiumCard.innerHTML = `
                <span class="podium-rank">${rankLabel}</span>
                <span class="podium-icon">${item.icon}</span>
                <span class="podium-name">${item.class_name}</span>
                <span class="podium-pct">${item.confidence.toFixed(2)}%</span>
            `;
            top3Podium.appendChild(podiumCard);
        });

        // 3. All 10 Class Probabilities Breakdown
        probabilityList.innerHTML = "";
        allSorted.forEach((item, idx) => {
            const isWinner = idx === 0;
            const row = document.createElement("div");
            row.className = `prob-row ${isWinner ? "prob-winner" : ""}`;
            row.innerHTML = `
                <div class="prob-info">
                    <span class="prob-icon">${item.icon}</span>
                    <span class="prob-name">${item.class_name}</span>
                </div>
                <div class="prob-bar-track">
                    <div class="prob-bar-fill" style="width: 0%" data-target="${item.confidence}"></div>
                </div>
                <span class="prob-pct-val">${item.confidence.toFixed(2)}%</span>
            `;
            probabilityList.appendChild(row);
        });

        // Trigger Bar Fill Animation
        setTimeout(() => {
            const barFills = probabilityList.querySelectorAll(".prob-bar-fill");
            barFills.forEach((bar) => {
                const targetPct = parseFloat(bar.getAttribute("data-target")) || 0;
                const displayWidth = targetPct > 0 && targetPct < 1 ? 1 : targetPct;
                bar.style.width = `${displayWidth}%`;
            });
        }, 40);
    }

    // --------------------------------------------------------------------------
    // Clear & Reset UI Handler
    // --------------------------------------------------------------------------

    clearBtn.addEventListener("click", () => {
        selectedFile = null;
        fileInput.value = "";

        dropzoneIdle.classList.remove("hidden");
        dropzonePreview.classList.add("hidden");
        previewImg.src = "";
        previewFilename.textContent = "";
        previewFilesize.textContent = "";

        predictBtn.disabled = true;
        btnSpinner.classList.add("hidden");
        btnLabel.textContent = "✦ Predict Image";
        hideError();

        loadingState.classList.add("hidden");
        resultContent.classList.add("hidden");
        idleState.classList.remove("hidden");
        inferenceBadge.textContent = "Awaiting Input";

        top3Podium.innerHTML = "";
        probabilityList.innerHTML = "";
    });
});
