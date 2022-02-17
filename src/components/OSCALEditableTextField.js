import React, { useRef, useState } from "react";
import Typography from "@material-ui/core/Typography";
import { Grid, TextField } from "@material-ui/core";
import OSCALEditableFieldActions, {
  getElementLabel,
} from "./OSCALEditableFieldActions";

function textFieldWithEditableActions(
  props,
  reference,
  inEditState,
  setInEditState
) {
  if (inEditState) {
    if (Number.isInteger(props.size)) {
      return (
        <>
          <Grid item xs={props.size} className={props.className}>
            <Typography>
              <TextField
                fullWidth
                inputProps={{
                  "data-testid": `textField-${getElementLabel(
                    props.editedField
                  )}`,
                }}
                inputRef={reference}
                size={props.textFieldSize}
                defaultValue={props.value}
                variant={props.textFieldVariant}
              />
            </Typography>
          </Grid>
          <Grid item>
            <OSCALEditableFieldActions
              inEditState={inEditState}
              editedField={props.editedField}
              setInEditState={setInEditState}
              onCancel={props.onCancel}
              onFieldSave={props.onFieldSave}
              patchData={props.patchData}
              reference={reference}
              update={props.update}
            />
          </Grid>
        </>
      );
    }

    return (
      <>
        <Typography display="inline" variant={props.typographyVariant}>
          <TextField
            inputProps={{
              "data-testid": `textField-${getElementLabel(props.editedField)}`,
            }}
            inputRef={reference}
            size={props.textFieldSize}
            defaultValue={props.defaultValue}
            variant={props.textFieldVariant}
          />
        </Typography>
        <OSCALEditableFieldActions
          appendToLastFieldInPath={props.appendToLastFieldInPath}
          inEditState={inEditState}
          editedField={props.editedField}
          setInEditState={setInEditState}
          onCancel={props.onCancel}
          onFieldSave={props.onFieldSave}
          patchData={props.patchData}
          reference={reference}
          update={props.update}
        />
      </>
    );
  }

  return (
    <>
      <Typography display="inline" variant={props.typographyVariant}>
        {props.value}
      </Typography>
      <OSCALEditableFieldActions
        editedField={props.editedField}
        inEditState={inEditState}
        patchData={props.patchData}
        setInEditState={setInEditState}
      />
    </>
  );
}

export default function OSCALEditableTextField(props) {
  const reference = useRef("reference to text field");
  const [inEditState, setInEditState] = useState(props.inEditState);

  return props.canEdit ? (
    textFieldWithEditableActions(props, reference, inEditState, setInEditState)
  ) : (
    <Grid item className={props.className}>
      <Typography variant={props.typographyVariant}>{props.value}</Typography>
    </Grid>
  );
}

OSCALEditableTextField.defaultProps = {
  textFieldVariant: "outlined",
};
