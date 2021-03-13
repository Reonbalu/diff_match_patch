import diff_match_patch from "diff-match-patch";
import { Col, Container, Form, Row } from "react-bootstrap";
import * as defaults from "./defaults";
import SelectionReference from "./SelectionReference";

import "bootstrap/dist/css/bootstrap.min.css";
import "./styles.css";
import { useMemo, useState } from "react";
import { Manager } from "react-popper";

const dmp = new diff_match_patch();

// 🪄
const diffReducer = ([current, remaining], [action, length]) => {
  // console.log(current, remaining, action, length);
  if (remaining === -1) {
    return [current, remaining];
  }

  switch (action) {
    case 0:
      if (remaining < length) {
        // Current span
        return [current + remaining, -1];
      } else {
        return [current + length, remaining - length];
      }
    case -1:
      if (remaining < length) {
        // Deleted
        return [current, -1];
      } else {
        return [current, remaining - length];
      }
    case 1:
      return [current + length, remaining];
    default:
      throw new Error("not implemented");
  }
};

export default function App() {
  const [oldText, setOldText] = useState(defaults.oldText);
  const [newText, setNewText] = useState(defaults.newText);
  const [selectedTextRange, setSelectedTextRange] = useState([25, 50]);
  const [selectedTextRangeStart, selectedTextRangeEnd] = selectedTextRange;
  const originalDiff = useMemo(() => dmp.diff_main(oldText, newText), [
    oldText,
    newText
  ]);
  const diff = useMemo(
    () => originalDiff.map(([action, text]) => [action, text.length, text]),
    [originalDiff]
  );
  const newSelectedTextRangeStart = useMemo(
    () => diff.reduce(diffReducer, [0, selectedTextRangeStart])[0],
    [diff, selectedTextRangeStart]
  );
  const newSelectedTextRangeEnd = useMemo(
    () => diff.reduce(diffReducer, [0, selectedTextRangeEnd])[0],
    [diff, selectedTextRangeEnd]
  );

  return (
    <div className="App">
      <Container>
        <Row>
          <Col lg>
            <Form.Group>
              <Form.Label>Edit Old Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={oldText}
                onChange={(e) => setOldText(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group>
              <Form.Label>Edit New Text</Form.Label>
              <Form.Control
                as="textarea"
                rows={10}
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <Form.Group>
              <h6>Diff</h6>
              <div
                className="difftext"
                dangerouslySetInnerHTML={{
                  __html: dmp.diff_prettyHtml(originalDiff)
                }}
              />
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col>
            <h6>Old selection (Highlight text to set selection)</h6>
            <pre>
              Start: {selectedTextRangeStart}
              <br />
              End: {selectedTextRangeEnd}
            </pre>
          </Col>
          <Col>
            <h6>New selection</h6>
            <pre>
              Start: {newSelectedTextRangeStart}
              <br />
              End: {newSelectedTextRangeEnd}
              <br />
              Span missing:{" "}
              {newSelectedTextRangeStart === newSelectedTextRangeEnd ? (
                <mark style={{ backgroundColor: "red", color: "white" }}>
                  true
                </mark>
              ) : (
                "false"
              )}
            </pre>
          </Col>
        </Row>
        <Row>
          <Col>
            <Manager>
              <SelectionReference
                onSelect={(selection) => {
                  const range = selection.getRangeAt(0);
                  setSelectedTextRange([range.startOffset, range.endOffset]);
                }}
              >
                {(getProps) => (
                  <pre {...getProps({ style: { whiteSpace: "pre-line" } })}>
                    {oldText}
                  </pre>
                )}
              </SelectionReference>
            </Manager>
          </Col>
          <Col>
            <pre style={{ whiteSpace: "pre-line" }}>
              {newText.slice(0, newSelectedTextRangeStart)}
              {newSelectedTextRangeStart !== newSelectedTextRangeEnd && (
                <mark style={{ backgroundColor: "red", color: "white" }}>
                  {newText.slice(
                    newSelectedTextRangeStart,
                    newSelectedTextRangeEnd
                  )}
                </mark>
              )}
              {newText.slice(newSelectedTextRangeEnd)}
            </pre>
          </Col>
        </Row>
        <Row>
          <Col>
            <h6>Diff</h6>
            <pre>{JSON.stringify(diff, null, 2)}</pre>
            <div
              dangerouslySetInnerHTML={{
                __html: dmp.diff_prettyHtml(originalDiff)
              }}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
}
