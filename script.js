async function startDownload() {
    const url = document.getElementById('videoUrl').value;
    if (!url) {
        alert('Please enter a URL');
        return;
    }

    try {
        const response = await fetch('https://apexreelsdaily-production.up.railway.app/download', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url })
        });

        const data = await response.json();

        if (data.success) {
            const videoId = data.video_id;
            document.getElementById('status').innerHTML = 
                `<p class="text-indigo-500 text-sm"><span class="font-medium">Requesting server to download your video.</span> Please wait...</p>`;

            const interval = setInterval(async () => {
                const statusResponse = await fetch(`https://apexreelsdaily-production.up.railway.app/status/${videoId}`);
                const statusData = await statusResponse.json();

                if (statusData.status === "Completed") {
                    clearInterval(interval);
                    document.getElementById('status').innerHTML = 
                        `<p class="text-indigo-500 text-sm">Downloading your video. Please wait...</p>`;

                    const fetchResponse = await fetch(`https://apexreelsdaily-production.up.railway.app/fetch/${videoId}`);
                    if (fetchResponse.ok) {
                        const blob = await fetchResponse.blob();
                        const downloadLink = document.createElement('a');
                        const url = URL.createObjectURL(blob);
                        downloadLink.href = url;
                        downloadLink.download = "downloaded_video.mp4";
                        downloadLink.click();
                        URL.revokeObjectURL(url);
                    } else {
                        document.getElementById('status').innerHTML = 
                            `<p class="text-red-500 text-sm">Error in downloading video. Please <span class="underline text-gray-800">report here</span>.</p>`;
                    }
                } else if (statusData.status === "Failed") {
                    clearInterval(interval);
                    document.getElementById('status').innerHTML = `<p class="text-red-500 text-sm">Something went wrong. Please try again later.</p>`;
                }
            }, 3000);
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error(error);
        document.getElementById('status').innerHTML = 
            `<p class="text-red-500 text-sm">Something went wrong. Please try again later.</p>`;
    }
}