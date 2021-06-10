import React from "react";
import Badge from "@material-ui/core/Badge";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import IconButton from "@material-ui/core/IconButton";
import LayersIcon from "@material-ui/icons/Layers";
import { makeStyles } from "@material-ui/core/styles";
import { Tooltip, Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  OSCALControlModificationsButton: {
    color: "#002867",
  },
}));

export default function OSCALControlModification(props) {
  const classes = useStyles();

  const [open, setOpen] = React.useState(false);

  const handleClick = () => {
    setOpen(!open);
  };
  const handleClose = () => {
    setOpen(false);
  };

  const getModLength = (adds, removes) => {
    let addsLength = 0;
    let removesLength = 0;
    if (adds) {
      addsLength = adds.length;
    }
    if (removes) {
      removesLength = removes.length;
    }
    return addsLength + removesLength;
  };

  let addsDisplay;
  let removesDisplay;
  if (props.alter.adds) {
    addsDisplay = (
      <DialogContent dividers>
        {props.alter.adds.map((add) => (
          // TODO - consider making this into a table
          <DialogContentText
            color="textprimary"
            id="scroll-dialog-description"
            tabIndex={-1}
            variant="h6"
          >
            Adds:
            {add.props.map((prop) => (
              <Typography
                color="textsecondary"
                paragraph="true"
                variant="body1"
              >
                Name:{prop.name}, Value:{prop.value}
              </Typography>
            ))}
          </DialogContentText>
        ))}
      </DialogContent>
    );
  }
  if (props.alter.removes) {
    removesDisplay = (
      <DialogContent dividers>
        {props.alter.removes.map((remove) => (
          // TODO - consider making this into a table
          <DialogContentText
            color="textprimary"
            id="scroll-dialog-description"
            tabIndex={-1}
            variant="h6"
          >
            Removes:
            <Typography color="textsecondary" paragraph="true" variant="body1">
              id-ref: {remove["id-ref"]}
              name-ref: {remove["name-ref"]}
            </Typography>
          </DialogContentText>
        ))}
      </DialogContent>
    );
  }

  return (
    <>
      <Tooltip title="Modifications">
        <Badge
          anchorOrigin={{
            vertical: "top",
            horizontal: "left",
          }}
          color="secondary"
          badgeContent={getModLength(props.alter.adds, props.alter.removes)}
          overlap="circle"
        >
          <IconButton
            variant="outlined"
            size="small"
            className={classes.OSCALControlModificationsButton}
            onClick={handleClick}
          >
            <LayersIcon />
          </IconButton>
        </Badge>
      </Tooltip>
      <Dialog
        open={open}
        onClose={handleClose}
        scroll="paper"
        aria-labelledby="scroll-dialog-title"
        aria-describedby="scroll-dialog-description"
      >
        <DialogTitle id="scroll-dialog-title">Modifications</DialogTitle>
        {addsDisplay}
        {removesDisplay}
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
