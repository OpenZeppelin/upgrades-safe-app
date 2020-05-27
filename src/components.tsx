import styled from "styled-components"
import React from "react"

const Card = styled.div`
  display: flex;
  justify-content: left;
`

export const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-around;
  margin-top: 15px;
`

export const WidgetWrapper: React.FC = ({ children }) => (
  <Card>
    <div>{children}</div>
  </Card>
);