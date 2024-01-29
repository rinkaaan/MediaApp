import { Container, ContentLayout, Header, SpaceBetween, TextContent } from "@cloudscape-design/components"

export function Component() {

  return (
    <ContentLayout
      header={
        <Header variant="h1">Settings</Header>
      }
    >
      <SpaceBetween size="l">
        <Container header={<Header variant="h2">App Info</Header>}>
          <TextContent>
            <p>Version 1.0.0</p>
            {[...Array(100)].map((_, i) => <p key={i}>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget ultricies ultrices, nunc nunc aliquam nunc, sit amet aliquam nunc nunc quis nunc. Donec euismod, nisl eget ultricies ultrices, nunc nunc aliquam nunc, sit amet aliquam nunc nunc quis nunc. Donec euismod, nisl eget ultricies ultrices, nunc nunc aliquam nunc, sit amet aliquam nunc nunc quis nunc. Donec euismod, nisl eget ultricies ultrices, nunc nunc aliquam nunc, sit amet aliquam nunc nunc quis nunc.</p>)}
          </TextContent>
        </Container>
      </SpaceBetween>
    </ContentLayout>
  )
}
