import React, { useState, useEffect, useRef } from "react";
import Alert from "@material-ui/lab/Alert";
import CircularProgress from "@material-ui/core/CircularProgress";
import OSCALSsp from "./OSCALSsp";
import OSCALCatalog from "./OSCALCatalog";
import OSCALComponentDefinition from "./OSCALComponentDefinition";
import OSCALProfile from "./OSCALProfile";
import OSCALLoaderForm from "./OSCALLoaderForm";

const onError = (error) => (
  <Alert severity="error">
    Yikes! Something went wrong loading the OSCAL data. Sorry, we&apos;ll look
    into it. ({error.message})
  </Alert>
);

const oscalObjectTypes = {
  catalog: {
    name: "Catalog",
    defaultUrl:
      "https://raw.githubusercontent.com/usnistgov/oscal-content/master/nist.gov/SP800-53/rev5/json/NIST_SP-800-53_rev5_catalog.json",
    defaultUuid: "613fca2d-704a-42e7-8e2b-b206fb92b456",
    jsonRootName: "catalog",
    restPath: "catalogs",
  },
  component: {
    name: "Component",
    defaultUrl:
      "https://raw.githubusercontent.com/EasyDynamics/oscal-content/manual-fix-of-component-paths/examples/component-definition/json/example-component.json",
    defaultUuid: "8223d65f-57a9-4689-8f06-2a975ae2ad72",
    jsonRootName: "component-definition",
    restPath: "component-definitions",
  },
  profile: {
    name: "Profile",
    defaultUrl:
      "https://raw.githubusercontent.com/usnistgov/oscal-content/master/nist.gov/SP800-53/rev4/json/NIST_SP-800-53_rev4_MODERATE-baseline_profile.json",
    defaultUuid: "8b3beca1-fcdc-43e0-aebb-ffc0a080c486",
    jsonRootName: "profile",
    restPath: "profiles",
  },
  ssp: {
    name: "SSP",
    defaultUrl:
      "https://raw.githubusercontent.com/usnistgov/oscal-content/master/examples/ssp/json/ssp-example.json",
    defaultUuid: "cff8385f-108e-40a5-8f7a-82f3dc0eaba8",
    jsonRootName: "system-security-plan",
    restPath: "system-security-plans",
  },
};

function populatePartialPatchData(data, editedFieldJsonPath, newValue) {
  if (editedFieldJsonPath.length === 1) {
    const editData = data;
    editData[editedFieldJsonPath] = newValue;
    return;
  }

  populatePartialPatchData(
    data[editedFieldJsonPath.shift()],
    editedFieldJsonPath,
    newValue
  );
}

/**
 *
 * @param partialPatchData data that will be passed into the body of the PATCH request, doesn't initially contain the updates
 * @param onSuccessfulPatch function that will update a state, forcing a re-rendering if the PATCH request is successful
 * @param editedFieldJsonPath path to the field that is being updated
 * @param newValue updated value for the edited field
 */
function restPatch(
  partialPatchData,
  onSuccessfulPatch,
  editedFieldJsonPath,
  newValue,
  jsonRootName,
  restPath
) {
  const url = `${process.env.REACT_APP_REST_BASE_URL}/${restPath}/${partialPatchData[jsonRootName].uuid}`;

  populatePartialPatchData(partialPatchData, editedFieldJsonPath, newValue);

  fetch(url, {
    method: "PATCH",
    body: JSON.stringify(partialPatchData),
  })
    .then((res) => res.json())
    .then(
      (result) => {
        onSuccessfulPatch(result);
      },
      () => {
        alert(
          `Could not update the ${editedFieldJsonPath} field with value: ${newValue}.`
        );
      }
    );
}

export default function OSCALLoader(props) {
  const [error, setError] = useState(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isResolutionComplete, setIsResolutionComplete] = useState(false);
  const [isRestMode, setIsRestMode] = useState(
    process.env.REACT_APP_REST_BASE_URL
  );
  const [oscalData, setOscalData] = useState([]);
  const [oscalUrl, setOscalUrl] = useState(isRestMode ? null : props.oscalUrl);
  const unmounted = useRef(false);

  const loadOscalData = (newOscalUrl) => {
    if (newOscalUrl) {
      fetch(newOscalUrl)
        .then((response) => {
          if (!response.ok) throw new Error(response.status);
          else return response.json();
        })
        .then(
          (result) => {
            if (!unmounted.current) {
              setOscalData(result);
              setIsLoaded(true);
              setError(null);
            }
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (e) => {
            setError(e);
            setIsLoaded(true);
          }
        );
    } else {
      setIsLoaded(true);
    }
  };

  const handleUrlChange = (event) => {
    setOscalUrl(event.target.value);
  };

  const handleUuidChange = (event) => {
    const newOscalUrl = `${process.env.REACT_APP_REST_BASE_URL}/${props.oscalObjectType.restPath}/${event.target.value}`;
    setOscalUrl(newOscalUrl);
    setIsLoaded(false);
    setIsResolutionComplete(false);
    loadOscalData(newOscalUrl);
  };

  const handleReloadClick = () => {
    // Only reload if we're done loading
    if (isLoaded && isResolutionComplete) {
      setIsLoaded(false);
      setIsResolutionComplete(false);
      loadOscalData(oscalUrl);
    }
  };

  const handleChangeRestMode = (event) => {
    setIsRestMode(event.target.checked);
    if (event.target.checked) {
      setOscalUrl(null);
      setIsLoaded(true);
      setIsResolutionComplete(true);
    } else {
      setIsLoaded(false);
      setIsResolutionComplete(false);
      setOscalUrl(props.oscalObjectType.defaultUrl);
      loadOscalData(props.oscalObjectType.defaultUrl);
    }
  };

  const onResolutionComplete = () => {
    setIsResolutionComplete(true);
  };

  // Note: the empty deps array [] means
  // this useEffect will run once
  // similar to componentDidMount()
  useEffect(() => {
    loadOscalData(oscalUrl);

    return () => {
      unmounted.current = true;
    };
  }, []);

  let form;
  if (props.renderForm) {
    form = (
      <OSCALLoaderForm
        oscalObjectType={props.oscalObjectType}
        oscalUrl={oscalUrl}
        onUrlChange={handleUrlChange}
        onUuidChange={handleUuidChange}
        onReloadClick={handleReloadClick}
        isRestMode={isRestMode}
        onChangeRestMode={handleChangeRestMode}
        isResolutionComplete={isResolutionComplete}
        onError={(e) => {
          setError(e);
          onError(e);
        }}
      />
    );
  }

  let result;
  if (error) {
    result = onError(error);
  } else if (!isLoaded) {
    result = <CircularProgress />;
  } else if (oscalUrl) {
    result = props.renderer(
      isRestMode,
      oscalData,
      oscalUrl,
      onResolutionComplete
    );
  }

  return (
    <>
      {form}
      {result}
    </>
  );
}

/**
 * Returns url parameter provided by the browser url, if it exists. If the url
 * parameter exists, we want to override the default viewer url.
 *
 * @returns The url parameter of the browser url, or null if it doesn't exist
 */
export function getRequestedUrl() {
  return new URLSearchParams(window.location.search).get("url");
}

export function OSCALCatalogLoader(props) {
  const oscalObjectType = oscalObjectTypes.catalog;
  const renderer = (isRestMode, oscalData, oscalUrl, onResolutionComplete) => (
    <OSCALCatalog
      catalog={oscalData[oscalObjectType.jsonRootName]}
      parentUrl={oscalUrl}
      onError={onError}
      onResolutionComplete={onResolutionComplete}
      onFieldSave={(data, update, editedField, newValue) => {
        restPatch(
          data,
          update,
          editedField,
          newValue,
          oscalObjectType.jsonRootName,
          oscalObjectType.restPath
        );
      }}
    />
  );
  return (
    <OSCALLoader
      oscalObjectType={oscalObjectType}
      oscalUrl={getRequestedUrl() || oscalObjectType.defaultUrl}
      renderer={renderer}
      renderForm={props.renderForm}
    />
  );
}

export function OSCALSSPLoader(props) {
  const oscalObjectType = oscalObjectTypes.ssp;
  const renderer = (isRestMode, oscalData, oscalUrl, onResolutionComplete) => (
    <OSCALSsp
      system-security-plan={oscalData[oscalObjectType.jsonRootName]}
      isEditable={isRestMode}
      parentUrl={oscalUrl}
      onError={onError}
      onResolutionComplete={onResolutionComplete}
      onFieldSave={(data, update, editedField, newValue) => {
        restPatch(
          data,
          update,
          editedField,
          newValue,
          oscalObjectType.jsonRootName,
          oscalObjectType.restPath
        );
      }}
    />
  );
  return (
    <OSCALLoader
      oscalObjectType={oscalObjectType}
      oscalUrl={getRequestedUrl() || oscalObjectType.defaultUrl}
      renderer={renderer}
      renderForm={props.renderForm}
    />
  );
}

export function OSCALComponentLoader(props) {
  const oscalObjectType = oscalObjectTypes.component;
  const renderer = (isRestMode, oscalData, oscalUrl, onResolutionComplete) => (
    <OSCALComponentDefinition
      componentDefinition={oscalData[oscalObjectType.jsonRootName]}
      parentUrl={oscalUrl}
      onError={onError}
      onResolutionComplete={onResolutionComplete}
      onFieldSave={(data, update, editedField, newValue) => {
        restPatch(
          data,
          update,
          editedField,
          newValue,
          oscalObjectType.jsonRootName,
          oscalObjectType.restPath
        );
      }}
    />
  );
  return (
    <OSCALLoader
      oscalObjectType={oscalObjectType}
      oscalUrl={getRequestedUrl() || oscalObjectType.defaultUrl}
      renderer={renderer}
      renderForm={props.renderForm}
    />
  );
}
export function OSCALProfileLoader(props) {
  const oscalObjectType = oscalObjectTypes.profile;
  const renderer = (isRestMode, oscalData, oscalUrl, onResolutionComplete) => (
    <OSCALProfile
      profile={oscalData[oscalObjectType.jsonRootName]}
      parentUrl={oscalUrl}
      onResolutionComplete={onResolutionComplete}
      onFieldSave={(data, update, editedField, newValue) => {
        restPatch(
          data,
          update,
          editedField,
          newValue,
          oscalObjectType.jsonRootName,
          oscalObjectType.restPath
        );
      }}
    />
  );
  return (
    <OSCALLoader
      oscalObjectType={oscalObjectType}
      oscalUrl={getRequestedUrl() || oscalObjectType.defaultUrl}
      renderer={renderer}
      renderForm={props.renderForm}
    />
  );
}
