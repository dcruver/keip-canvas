import com.octo.keip.flow.DefaultErrorListener
import spock.lang.Specification

import javax.xml.transform.TransformerException

class DefaultErrorListenerSanityTest extends Specification {

    def errorListener = new DefaultErrorListener()

    def "Error and warning methods log without throwing exception"() {
        given:
        errorListener.warning(new TransformerException("expected warning"))
        errorListener.error(new TransformerException("expected error"))
    }

    def "Fatal error throws an exception"() {
        when:
        errorListener.fatalError(new TransformerException("fatal"))

        then:
        thrown(TransformerException)
    }
}
