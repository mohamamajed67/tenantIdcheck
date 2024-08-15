var lookupEnvironment = "Worldwide";

document.getElementById('environment').addEventListener('change', function () {
    lookupEnvironment = this.value;
    var placeholder = "Enter tenant name or GUID";

    switch (lookupEnvironment) {
        case 'Worldwide':
            placeholder = "contoso.onmicrosoft.com";
            break;
        case 'US Government':
            placeholder = "contoso.onmicrosoft.us";
            break;
        case 'China':
            placeholder = "contoso.partner.onmschina.cn";
            break;
    }
    document.getElementById('tenant-input').setAttribute("placeholder", placeholder);
});

document.getElementById('lookup-form').addEventListener('submit', function (e) {
    e.preventDefault();
    lookupTenant();
});

function lookupTenant() {
    var tenant = document.getElementById('tenant-input').value.trim();
    var resultsDiv = document.getElementById('results');
    var errorMessageDiv = document.getElementById('error-message');

    resetView();

    var lookupUrl = "https://login.microsoftonline.com/" + tenant + "/.well-known/openid-configuration";

    switch (lookupEnvironment) {
        case 'Worldwide':
            lookupUrl = "https://login.microsoftonline.com/" + tenant + "/.well-known/openid-configuration";
            break;
        case 'US Government':
            lookupUrl = "https://login.microsoftonline.us/" + tenant + "/.well-known/openid-configuration";
            break;
        case 'China':
            lookupUrl = "https://login.partner.microsoftonline.cn/" + tenant + "/.well-known/openid-configuration";
            break;
    }

    fetch(lookupUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Lookup failed');
            }
            return response.json();
        })
        .then(data => {
            try {
                var tenantIdRegEx = /^https:\/\/login\.microsoftonline\.(?:us|com)\/([\dA-Fa-f]{8}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{4}-[\dA-Fa-f]{12})\/oauth2\/authorize$/;
                var tenantAuthEndpoint = data.authorization_endpoint;
                var tenantId = tenantAuthEndpoint.match(tenantIdRegEx)[1];

                document.getElementById("search-string").textContent = tenant;
                document.getElementById("tenant-id").textContent = tenantId;

                var tenantRegion = "Unknown";
                switch (data.tenant_region_scope) {
                    case 'USGov':
                        tenantRegion = "Azure AD Government";
                        break;
                    case 'WW':
                        tenantRegion = "Azure AD Global";
                        break;
                    case 'China':
                        tenantRegion = "Azure AD China";
                        break;
                }
                document.getElementById("azure-ad-instance").textContent = tenantRegion;

                var tenantScope = "Not applicable";
                switch (data.tenant_region_sub_scope) {
                    case 'DOD':
                        tenantScope = "DOD";
                        break;
                    case 'GCC':
                        tenantScope = "GCC";
                        break;
                    case 'GCC High':
                        tenantScope = "GCC High";
                        break;
                }
                document.getElementById("tenant-scope").textContent = tenantScope;

                resultsDiv.style.display = 'block';
            } catch (error) {
                handleError();
            }
        })
        .catch(error => {
            handleError();
        });

    function handleError() {
        resetView();
        errorMessageDiv.style.display = 'block';
    }
}

function resetView() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('error-message').style.display = 'none';
}

function copyResults() {
    var resultsText = `
        Tenant Name: ${document.getElementById('search-string').textContent}
        Tenant ID: ${document.getElementById('tenant-id').textContent}
        Azure AD Instance: ${document.getElementById('azure-ad-instance').textContent}
        Tenant Scope: ${document.getElementById('tenant-scope').textContent}
    `;
    navigator.clipboard.writeText(resultsText).then(function() {
        showCopyTooltip();
    }, function(err) {
        console.error('Failed to copy results: ', err);
    });
}

function showCopyTooltip() {
    var tooltip = document.querySelector('.copy-tooltip');
    tooltip.classList.add('show');
    setTimeout(() => {
        tooltip.classList.remove('show');
    }, 2000);
}